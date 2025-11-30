import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  /**
   * Update material progress for a user
   */
  async updateMaterialProgress(
    materialId: string,
    userId: string,
    updateProgressDto: UpdateProgressDto,
  ) {
    // Verify material exists
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: {
        topic: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // Find or create enrollment
    let enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: material.topic.course.id,
        },
      },
    });

    if (!enrollment) {
      // Auto-enroll user if not enrolled
      enrollment = await this.prisma.enrollment.create({
        data: {
          userId,
          courseId: material.topic.course.id,
          progressPercent: 0,
          lastAccessedAt: new Date(),
        },
      });
    }

    // Update or create progress record
    const progress = await this.prisma.progress.upsert({
      where: {
        enrollmentId_materialId: {
          enrollmentId: enrollment.id,
          materialId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        materialId,
        watchedDuration: updateProgressDto.watchedDuration || 0,
        isCompleted: updateProgressDto.isCompleted || false,
        lastAccessedAt: new Date(),
      },
      update: {
        watchedDuration: updateProgressDto.watchedDuration,
        isCompleted: updateProgressDto.isCompleted,
        lastAccessedAt: new Date(),
      },
    });

    // Update enrollment last accessed
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        lastAccessedAt: new Date(),
      },
    });

    // Recalculate course progress
    await this.recalculateCourseProgress(enrollment.id, material.topic.course.id);

    return progress;
  }

  /**
   * Get material progress for a user
   */
  async getMaterialProgress(materialId: string, userId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: {
        topic: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: material.topic.course.id,
        },
      },
    });

    if (!enrollment) {
      return {
        materialId,
        watchedDuration: 0,
        isCompleted: false,
        lastAccessedAt: null,
      };
    }

    const progress = await this.prisma.progress.findUnique({
      where: {
        enrollmentId_materialId: {
          enrollmentId: enrollment.id,
          materialId,
        },
      },
    });

    if (!progress) {
      return {
        materialId,
        watchedDuration: 0,
        isCompleted: false,
        lastAccessedAt: null,
      };
    }

    return progress;
  }

  /**
   * Mark material as complete
   */
  async markMaterialComplete(materialId: string, userId: string) {
    return this.updateMaterialProgress(materialId, userId, { isCompleted: true });
  }

  /**
   * Get topic progress (all materials in a topic)
   */
  async getTopicProgress(topicId: string, userId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        course: true,
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

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: topic.course.id,
        },
      },
    });

    if (!enrollment) {
      // Return empty progress for all materials
      return {
        topicId,
        materials: topic.materials.map((material) => ({
          materialId: material.id,
          watchedDuration: 0,
          isCompleted: false,
          lastAccessedAt: null,
        })),
        completedCount: 0,
        totalCount: topic.materials.length,
        progressPercent: 0,
      };
    }

    // Get all progress records for materials in this topic
    const progressRecords = await this.prisma.progress.findMany({
      where: {
        enrollmentId: enrollment.id,
        materialId: {
          in: topic.materials.map((m) => m.id),
        },
      },
    });

    const progressMap = new Map<string, typeof progressRecords[0]>(
      progressRecords.map((p) => [p.materialId, p])
    );

    const materialsProgress = topic.materials.map((material) => {
      const progress = progressMap.get(material.id);
      return {
        materialId: material.id,
        watchedDuration: progress?.watchedDuration || 0,
        isCompleted: progress?.isCompleted || false,
        lastAccessedAt: progress?.lastAccessedAt || null,
      };
    });

    const completedCount = materialsProgress.filter((p) => p.isCompleted).length;
    const progressPercent =
      topic.materials.length > 0 ? Math.round((completedCount / topic.materials.length) * 100) : 0;

    return {
      topicId,
      materials: materialsProgress,
      completedCount,
      totalCount: topic.materials.length,
      progressPercent,
    };
  }

  /**
   * Recalculate course progress and update enrollment
   */
  private async recalculateCourseProgress(enrollmentId: string, courseId: string) {
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
      return;
    }

    const totalMaterials = course.topics.reduce((sum, topic) => sum + topic.materials.length, 0);

    if (totalMaterials === 0) {
      await this.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { progressPercent: 0 },
      });
      return;
    }

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
    const progressPercent = Math.round((completedCount / totalMaterials) * 100);

    await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { progressPercent },
    });

    // If 100% complete, mark course as completed
    if (progressPercent === 100) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });

      if (enrollment && !enrollment.completedAt) {
        await this.prisma.enrollment.update({
          where: { id: enrollmentId },
          data: { completedAt: new Date() },
        });
      }
    }
  }
}

