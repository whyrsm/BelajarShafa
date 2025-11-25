import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate slug from category name
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto) {
    const slug = this.slugify(createCategoryDto.name);

    // Check if slug already exists
    const existing = await this.prisma.courseCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }

    return this.prisma.courseCategory.create({
      data: {
        name: createCategoryDto.name,
        slug,
        description: createCategoryDto.description,
      },
    });
  }

  /**
   * Get all categories
   */
  async findAll() {
    return this.prisma.courseCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });
  }

  /**
   * Get a single category by ID
   */
  async findOne(id: string) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Update a category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updateData: any = {};

    if (updateCategoryDto.name) {
      const slug = this.slugify(updateCategoryDto.name);
      // Check if new slug conflicts with another category
      const existing = await this.prisma.courseCategory.findUnique({
        where: { slug },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Category with this name already exists');
      }

      updateData.name = updateCategoryDto.name;
      updateData.slug = slug;
    }

    if (updateCategoryDto.description !== undefined) {
      updateData.description = updateCategoryDto.description;
    }

    return this.prisma.courseCategory.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a category (only if no courses assigned)
   */
  async remove(id: string) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.courses > 0) {
      throw new BadRequestException(
        'Cannot delete category with assigned courses. Please reassign or delete courses first.',
      );
    }

    return this.prisma.courseCategory.delete({
      where: { id },
    });
  }
}

