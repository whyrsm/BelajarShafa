import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new course
   */
  async create(createCourseDto: CreateCourseDto, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can create courses');
    }

    // Verify category exists
    const category = await this.prisma.courseCategory.findUnique({
      where: { id: createCourseDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        description: createCourseDto.description,
        thumbnailUrl: createCourseDto.thumbnailUrl,
        level: createCourseDto.level,
        estimatedDuration: createCourseDto.estimatedDuration,
        prerequisites: createCourseDto.prerequisites,
        type: createCourseDto.type,
        categoryId: createCourseDto.categoryId,
        createdById: userId,
        isActive: true,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        topics: {
          orderBy: {
            sequence: 'asc',
          },
          include: {
            materials: {
              orderBy: {
                sequence: 'asc',
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get all courses with optional filters
   */
  async findAll(filters: CourseFilterDto = {}) {
    const where: any = {
      isActive: true,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.level) {
      where.level = filters.level;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return this.prisma.course.findMany({
      where,
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        topics: {
          orderBy: {
            sequence: 'asc',
          },
          include: {
            _count: {
              select: {
                materials: true,
              },
            },
          },
        },
        _count: {
          select: {
            topics: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a single course by ID with full details
   */
  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        topics: {
          orderBy: {
            sequence: 'asc',
          },
          include: {
            materials: {
              orderBy: {
                sequence: 'asc',
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  /**
   * Update a course
   */
  async update(id: string, updateCourseDto: UpdateCourseDto, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can update courses');
    }

    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user is the creator or is admin
    if (course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update courses you created');
    }

    // If categoryId is being updated, verify it exists
    if (updateCourseDto.categoryId) {
      const category = await this.prisma.courseCategory.findUnique({
        where: { id: updateCourseDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...updateCourseDto,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        topics: {
          orderBy: {
            sequence: 'asc',
          },
          include: {
            materials: {
              orderBy: {
                sequence: 'asc',
              },
            },
          },
        },
      },
    });
  }

  /**
   * Soft delete a course (set isActive = false)
   */
  async remove(id: string, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can delete courses');
    }

    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user is the creator or is admin
    if (course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete courses you created');
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Duplicate a course with all topics and materials
   */
  async duplicate(id: string, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can duplicate courses');
    }

    const originalCourse = await this.prisma.course.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: {
            sequence: 'asc',
          },
          include: {
            materials: {
              orderBy: {
                sequence: 'asc',
              },
            },
          },
        },
      },
    });

    if (!originalCourse) {
      throw new NotFoundException('Course not found');
    }

    // Create new course
    const newCourse = await this.prisma.course.create({
      data: {
        title: `${originalCourse.title} (Copy)`,
        description: originalCourse.description,
        thumbnailUrl: originalCourse.thumbnailUrl,
        level: originalCourse.level,
        estimatedDuration: originalCourse.estimatedDuration,
        prerequisites: originalCourse.prerequisites,
        type: originalCourse.type,
        categoryId: originalCourse.categoryId,
        createdById: userId,
        isActive: true,
      },
    });

    // Duplicate topics and materials
    for (const topic of originalCourse.topics) {
      const newTopic = await this.prisma.topic.create({
        data: {
          courseId: newCourse.id,
          title: topic.title,
          description: topic.description,
          sequence: topic.sequence,
          estimatedDuration: topic.estimatedDuration,
          isMandatory: topic.isMandatory,
        },
      });

      // Duplicate materials
      for (const material of topic.materials) {
        await this.prisma.material.create({
          data: {
            topicId: newTopic.id,
            type: material.type,
            title: material.title,
            content: material.content as any,
            sequence: material.sequence,
            estimatedDuration: material.estimatedDuration,
          },
        });
      }
    }

    return this.findOne(newCourse.id);
  }

  /**
   * Get enrollment statistics for a course
   */
  async getStats(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // TODO: Implement enrollment stats when enrollment model is created
    // For now, return basic course stats
    const stats = await this.prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            topics: true,
          },
        },
        topics: {
          include: {
            _count: {
              select: {
                materials: true,
              },
            },
          },
        },
      },
    });

    const totalMaterials = stats?.topics.reduce((sum, topic) => sum + topic._count.materials, 0) || 0;

    return {
      courseId: id,
      totalTopics: stats?._count.topics || 0,
      totalMaterials,
      // TODO: Add enrollment stats when enrollment model is implemented
      totalEnrollments: 0,
      completionRate: 0,
    };
  }
}

