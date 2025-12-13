import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Enroll user in a course
   */
  async enroll(courseId: string, userId: string) {
    // Verify course exists and is active
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.isActive) {
      throw new BadRequestException('Course is not active');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    // Create enrollment
    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        progressPercent: 0,
        lastAccessedAt: new Date(),
      },
      include: {
        course: {
          include: {
            category: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                topics: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Unenroll user from a course
   */
  async unenroll(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    // Delete enrollment and all associated progress
    await this.prisma.enrollment.delete({
      where: {
        id: enrollment.id,
      },
    });

    return { message: 'Successfully unenrolled from course' };
  }

  /**
   * Get all enrollments for a user
   */
  async getMyEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
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
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await this.calculateCourseProgress(enrollment.courseId, enrollment.id);
        return {
          ...enrollment,
          progressPercent: progress,
        };
      }),
    );

    return enrollmentsWithProgress;
  }

  /**
   * Get enrollment for a specific course
   */
  async getCourseEnrollment(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
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
                _count: {
                  select: {
                    materials: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return null;
    }

    // Calculate current progress
    const progress = await this.calculateCourseProgress(courseId, enrollment.id);

    return {
      ...enrollment,
      progressPercent: progress,
    };
  }

  /**
   * Calculate course progress percentage
   */
  private async calculateCourseProgress(courseId: string, enrollmentId: string): Promise<number> {
    // Get all materials in the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        topics: {
          include: {
            materials: true,
          },
        },
      },
    });

    if (!course || course.topics.length === 0) {
      return 0;
    }

    // Count total materials
    const totalMaterials = course.topics.reduce((sum, topic) => sum + topic.materials.length, 0);

    if (totalMaterials === 0) {
      return 0;
    }

    // Count completed materials
    const completedProgress = await this.prisma.progress.findMany({
      where: {
        enrollmentId,
        isCompleted: true,
        material: {
          topic: {
            courseId,
          },
        },
      },
    });

    const completedCount = completedProgress.length;

    // Calculate percentage
    return Math.round((completedCount / totalMaterials) * 100);
  }

  /**
   * Update enrollment last accessed time
   */
  async updateLastAccessed(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return;
    }

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        lastAccessedAt: new Date(),
      },
    });
  }

  /**
   * Mark course as completed
   */
  async markCourseCompleted(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    const progress = await this.calculateCourseProgress(courseId, enrollment.id);

    if (progress < 100) {
      throw new BadRequestException('Course is not yet completed');
    }

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        completedAt: new Date(),
        progressPercent: 100,
      },
    });
  }
}



