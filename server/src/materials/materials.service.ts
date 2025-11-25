import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto, MaterialType } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ReorderMaterialsDto } from './dto/reorder-materials.dto';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate material content based on type
   */
  private validateMaterialContent(type: MaterialType, content: any): void {
    switch (type) {
      case MaterialType.VIDEO:
        if (!content.videoUrl) {
          throw new BadRequestException('Video URL is required for VIDEO material');
        }
        // Validate YouTube URL format
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        if (!youtubeRegex.test(content.videoUrl)) {
          throw new BadRequestException('Invalid YouTube URL format');
        }
        break;
      case MaterialType.DOCUMENT:
        if (!content.documentUrl) {
          throw new BadRequestException('Document URL is required for DOCUMENT material');
        }
        break;
      case MaterialType.ARTICLE:
        if (!content.articleContent) {
          throw new BadRequestException('Article content is required for ARTICLE material');
        }
        break;
      case MaterialType.EXTERNAL_LINK:
        if (!content.externalUrl) {
          throw new BadRequestException('External URL is required for EXTERNAL_LINK material');
        }
        // Validate URL format
        try {
          new URL(content.externalUrl);
        } catch {
          throw new BadRequestException('Invalid URL format');
        }
        break;
      default:
        throw new BadRequestException(`Unknown material type: ${type}`);
    }
  }

  /**
   * Create a new material in a topic
   */
  async create(createMaterialDto: CreateMaterialDto, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can create materials');
    }

    // Verify topic exists and get course info
    const topic = await this.prisma.topic.findUnique({
      where: { id: createMaterialDto.topicId },
      include: {
        course: true,
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only add materials to topics in courses you created');
    }

    // Validate content based on type
    this.validateMaterialContent(createMaterialDto.type, createMaterialDto.content);

    // If sequence not provided, get the next sequence number
    let sequence = createMaterialDto.sequence;
    if (!sequence) {
      const lastMaterial = await this.prisma.material.findFirst({
        where: { topicId: createMaterialDto.topicId },
        orderBy: { sequence: 'desc' },
      });
      sequence = lastMaterial ? lastMaterial.sequence + 1 : 1;
    } else {
      // Check if sequence already exists
      const existing = await this.prisma.material.findUnique({
        where: {
          topicId_sequence: {
            topicId: createMaterialDto.topicId,
            sequence,
          },
        },
      });

      if (existing) {
        throw new BadRequestException(`Material with sequence ${sequence} already exists in this topic`);
      }
    }

    return this.prisma.material.create({
      data: {
        topicId: createMaterialDto.topicId,
        type: createMaterialDto.type,
        title: createMaterialDto.title,
        content: createMaterialDto.content as any,
        sequence,
        estimatedDuration: createMaterialDto.estimatedDuration,
      },
    });
  }

  /**
   * Get all materials for a topic
   */
  async findAll(topicId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return this.prisma.material.findMany({
      where: { topicId },
      orderBy: {
        sequence: 'asc',
      },
    });
  }

  /**
   * Get a single material by ID
   */
  async findOne(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  /**
   * Update a material
   */
  async update(id: string, updateMaterialDto: UpdateMaterialDto, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can update materials');
    }

    const material = await this.prisma.material.findUnique({
      where: { id },
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

    if (material.topic.course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update materials in courses you created');
    }

    // If type or content is being updated, validate
    const type: MaterialType = updateMaterialDto.type || (material.type as MaterialType);
    const content = updateMaterialDto.content || (material.content as any);

    if (updateMaterialDto.content || updateMaterialDto.type) {
      this.validateMaterialContent(type, content);
    }

    // If sequence is being updated, check for conflicts
    if (updateMaterialDto.sequence !== undefined && updateMaterialDto.sequence !== material.sequence) {
      const existing = await this.prisma.material.findUnique({
        where: {
          topicId_sequence: {
            topicId: material.topicId,
            sequence: updateMaterialDto.sequence,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(`Material with sequence ${updateMaterialDto.sequence} already exists in this topic`);
      }
    }

    return this.prisma.material.update({
      where: { id },
      data: {
        type: updateMaterialDto.type,
        title: updateMaterialDto.title,
        content: updateMaterialDto.content as any,
        sequence: updateMaterialDto.sequence,
        estimatedDuration: updateMaterialDto.estimatedDuration,
      },
    });
  }

  /**
   * Delete a material
   */
  async remove(id: string, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can delete materials');
    }

    const material = await this.prisma.material.findUnique({
      where: { id },
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

    if (material.topic.course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete materials in courses you created');
    }

    return this.prisma.material.delete({
      where: { id },
    });
  }

  /**
   * Reorder materials in a topic
   */
  async reorder(topicId: string, reorderDto: ReorderMaterialsDto, userId: string, userRole: string) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Managers can reorder materials');
    }

    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        course: true,
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.course.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only reorder materials in courses you created');
    }

    // Verify all materials belong to this topic
    const materialIds = reorderDto.materials.map(m => m.id);
    const materials = await this.prisma.material.findMany({
      where: {
        id: { in: materialIds },
        topicId,
      },
    });

    if (materials.length !== materialIds.length) {
      throw new BadRequestException('One or more materials do not belong to this topic');
    }

    // Update sequences in a transaction
    const updates = reorderDto.materials.map(material =>
      this.prisma.material.update({
        where: { id: material.id },
        data: { sequence: material.sequence },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findAll(topicId);
  }
}

