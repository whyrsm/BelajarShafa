import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ReorderTopicsDto } from './dto/reorder-topics.dto';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new topic in a course
   */
  async create(createTopicDto: CreateTopicDto, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can create topics');
    }

    // Verify course exists and user has permission
    const course = await this.prisma.course.findUnique({
      where: { id: createTopicDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only add topics to courses you created');
    }

    // If sequence not provided, get the next sequence number
    let sequence = createTopicDto.sequence;
    if (!sequence) {
      const lastTopic = await this.prisma.topic.findFirst({
        where: { courseId: createTopicDto.courseId },
        orderBy: { sequence: 'desc' },
      });
      sequence = lastTopic ? lastTopic.sequence + 1 : 1;
    } else {
      // Check if sequence already exists
      const existing = await this.prisma.topic.findUnique({
        where: {
          courseId_sequence: {
            courseId: createTopicDto.courseId,
            sequence,
          },
        },
      });

      if (existing) {
        throw new BadRequestException(`Topic with sequence ${sequence} already exists in this course`);
      }
    }

    return this.prisma.topic.create({
      data: {
        courseId: createTopicDto.courseId,
        title: createTopicDto.title,
        description: createTopicDto.description,
        sequence,
        estimatedDuration: createTopicDto.estimatedDuration,
        isMandatory: createTopicDto.isMandatory ?? false,
      },
      include: {
        materials: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });
  }

  /**
   * Get all topics for a course
   */
  async findAll(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.topic.findMany({
      where: { courseId },
      orderBy: {
        sequence: 'asc',
      },
      include: {
        _count: {
          select: {
            materials: true,
          },
        },
        materials: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });
  }

  /**
   * Get a single topic by ID
   */
  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        materials: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  /**
   * Update a topic
   */
  async update(id: string, updateTopicDto: UpdateTopicDto, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can update topics');
    }

    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update topics in courses you created');
    }

    // If sequence is being updated, check for conflicts
    if (updateTopicDto.sequence !== undefined && updateTopicDto.sequence !== topic.sequence) {
      const existing = await this.prisma.topic.findUnique({
        where: {
          courseId_sequence: {
            courseId: topic.courseId,
            sequence: updateTopicDto.sequence,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(`Topic with sequence ${updateTopicDto.sequence} already exists in this course`);
      }
    }

    return this.prisma.topic.update({
      where: { id },
      data: {
        title: updateTopicDto.title,
        description: updateTopicDto.description,
        sequence: updateTopicDto.sequence,
        estimatedDuration: updateTopicDto.estimatedDuration,
        isMandatory: updateTopicDto.isMandatory,
      },
      include: {
        materials: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });
  }

  /**
   * Delete a topic (with warning check for user progress)
   */
  async remove(id: string, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can delete topics');
    }

    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        course: true,
        _count: {
          select: {
            materials: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete topics in courses you created');
    }

    // TODO: Check for user progress when enrollment/progress tracking is implemented
    // For now, we'll just check if there are materials
    if (topic._count.materials > 0) {
      // This is a warning - we'll still allow deletion but log it
      console.warn(`Deleting topic ${id} with ${topic._count.materials} materials`);
    }

    return this.prisma.topic.delete({
      where: { id },
    });
  }

  /**
   * Reorder topics in a course
   */
  async reorder(courseId: string, reorderDto: ReorderTopicsDto, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can reorder topics');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only reorder topics in courses you created');
    }

    // Verify all topics belong to this course
    const topicIds = reorderDto.topics.map(t => t.id);
    const topics = await this.prisma.topic.findMany({
      where: {
        id: { in: topicIds },
        courseId,
      },
    });

    if (topics.length !== topicIds.length) {
      throw new BadRequestException('One or more topics do not belong to this course');
    }

    // Update sequences in a transaction
    const updates = reorderDto.topics.map(topic =>
      this.prisma.topic.update({
        where: { id: topic.id },
        data: { sequence: topic.sequence },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findAll(courseId);
  }
}

