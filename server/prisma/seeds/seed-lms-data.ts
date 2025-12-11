import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file from project root
config({ path: resolve(__dirname, '../../../.env') });

// Initialize Prisma Client with adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CSVRow {
  no: string;
  courseCategory: string;
  courseTitle: string;
  courseTopics: string;
  contentType: string;
  title: string;
  url: string;
}

function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(';').map(h => h.trim());
  
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    if (values.length >= 7) {
      rows.push({
        no: values[0]?.trim() || '',
        courseCategory: values[1]?.trim() || '',
        courseTitle: values[2]?.trim() || '',
        courseTopics: values[3]?.trim() || '',
        contentType: values[4]?.trim() || '',
        title: values[5]?.trim() || '',
        url: values[6]?.trim() || '',
      });
    }
  }
  return rows;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('Starting LMS data seeding...');

  // Resolve CSV path relative to project root
  const csvPath = path.resolve(__dirname, '../../../docs/lms-materi.csv');
  const rows = parseCSV(csvPath);
  console.log(`Parsed ${rows.length} rows from CSV`);

  // Step 1: Create categories
  const uniqueCategories = [...new Set(rows.map(r => r.courseCategory))].filter(Boolean);
  console.log(`Found ${uniqueCategories.length} unique categories`);

  const categoryMap = new Map<string, string>();
  for (const categoryName of uniqueCategories) {
    const slug = slugify(categoryName);
    const category = await prisma.courseCategory.upsert({
      where: { slug },
      update: {},
      create: {
        name: categoryName,
        slug,
      },
    });
    categoryMap.set(categoryName, category.id);
    console.log(`Created/updated category: ${categoryName}`);
  }

  // Step 2: Create courses
  const uniqueCourses = new Map<string, { category: string; title: string }>();
  for (const row of rows) {
    if (row.courseTitle && row.courseCategory) {
      uniqueCourses.set(row.courseTitle, {
        category: row.courseCategory,
        title: row.courseTitle,
      });
    }
  }
  console.log(`Found ${uniqueCourses.size} unique courses`);

  // Get a manager user to assign as creator (or create a default one)
  let managerUser = await prisma.user.findFirst({
    where: { roles: { has: 'MANAGER' } },
  });

  if (!managerUser) {
    // Create a default manager if none exists
    managerUser = await prisma.user.create({
      data: {
        email: 'manager@belajarshafa.com',
        password: '$2b$10$dummy', // Dummy password, should be changed
        name: 'Default Manager',
        whatsappNumber: '+6281234567891',
        roles: ['MANAGER'],
      },
    });
    console.log('Created default manager user for course creation');
  }

  const courseMap = new Map<string, string>();
  for (const [courseTitle, courseData] of uniqueCourses) {
    const categoryId = categoryMap.get(courseData.category);
    if (!categoryId) continue;

    // Check if course already exists
    let course = await prisma.course.findFirst({
      where: {
        title: courseTitle,
        categoryId,
      },
    });

    if (!course) {
      course = await prisma.course.create({
        data: {
          title: courseTitle,
          description: `Course: ${courseTitle}`,
          level: 'BEGINNER', // Default level
          type: 'PUBLIC',
          categoryId,
          createdById: managerUser.id,
          isActive: true,
        },
      });
      console.log(`Created course: ${courseTitle}`);
    } else {
      console.log(`Course already exists: ${courseTitle}`);
    }

    courseMap.set(courseTitle, course.id);
  }

  // Step 3: Create topics per course
  const topicMap = new Map<string, string>(); // key: "courseTitle|topicName"
  const courseTopics = new Map<string, Map<string, number>>(); // course -> topic -> sequence

  for (const row of rows) {
    if (!row.courseTitle || !row.courseTopics) continue;
    
    if (!courseTopics.has(row.courseTitle)) {
      courseTopics.set(row.courseTitle, new Map());
    }
    const topics = courseTopics.get(row.courseTitle)!;
    if (!topics.has(row.courseTopics)) {
      topics.set(row.courseTopics, topics.size + 1);
    }
  }

  for (const [courseTitle, topics] of courseTopics) {
    const courseId = courseMap.get(courseTitle);
    if (!courseId) continue;

    for (const [topicName, sequence] of topics) {
      const topicKey = `${courseTitle}|${topicName}`;
      const existingTopic = await prisma.topic.findFirst({
        where: {
          courseId,
          title: topicName,
        },
      });

      let topic;
      if (existingTopic) {
        topic = existingTopic;
      } else {
        topic = await prisma.topic.create({
          data: {
            courseId,
            title: topicName,
            description: `Topic: ${topicName}`,
            sequence,
            isMandatory: false,
          },
        });
      }
      topicMap.set(topicKey, topic.id);
      console.log(`Created/updated topic: ${topicName} in course ${courseTitle}`);
    }
  }

  // Step 4: Create materials
  const materialSequenceMap = new Map<string, number>(); // topicId -> next sequence

  for (const row of rows) {
    if (!row.courseTitle || !row.courseTopics || !row.title || !row.url) continue;

    const topicKey = `${row.courseTitle}|${row.courseTopics}`;
    const topicId = topicMap.get(topicKey);
    if (!topicId) {
      console.warn(`Topic not found for: ${topicKey}`);
      continue;
    }

    const currentSequence = materialSequenceMap.get(topicId) || 0;
    const nextSequence = currentSequence + 1;
    materialSequenceMap.set(topicId, nextSequence);

    // Check if material already exists
    const existingMaterial = await prisma.material.findFirst({
      where: {
        topicId,
        title: row.title,
      },
    });

    if (existingMaterial) {
      console.log(`Material already exists: ${row.title}`);
      continue;
    }

    // Extract YouTube video ID from URL
    let videoUrl = row.url;
    if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } else if (videoUrl.includes('youtube.com/watch?v=')) {
      // Already in correct format
    }

    await prisma.material.create({
      data: {
        topicId,
        type: 'VIDEO',
        title: row.title,
        content: {
          videoUrl,
        },
        sequence: nextSequence,
      },
    });
    console.log(`Created material: ${row.title}`);
  }

  console.log('LMS data seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

