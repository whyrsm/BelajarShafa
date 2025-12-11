import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findAllFiltered(filterDto: UserFilterDto, managerId?: string) {
    try {
      const {
        search,
        roles,
        organizationId,
        classId,
        isActive,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filterDto;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.UserWhereInput = {};
      const andConditions: Prisma.UserWhereInput[] = [];

      // Manager scope: filter by organizations and classes
      if (managerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: managerId },
        include: {
          managedOrgs: { select: { id: true } },
          memberOrgs: { select: { id: true } },
          mentoredClasses: { select: { id: true } },
        },
      });

        if (manager) {
          const orgIds = [
            ...manager.managedOrgs.map(org => org.id),
            ...manager.memberOrgs.map(org => org.id),
          ];
          const classIds = manager.mentoredClasses.map(cls => cls.id);

          // If manager has no orgs or classes, return empty result
          if (orgIds.length === 0 && classIds.length === 0) {
            return {
              data: [],
              meta: {
                total: 0,
                page,
                limit,
                totalPages: 0,
              },
            };
          }

          const managerScopeConditions: Prisma.UserWhereInput[] = [];
          if (orgIds.length > 0) {
            managerScopeConditions.push(
              { managedOrgs: { some: { id: { in: orgIds } } } },
              { memberOrgs: { some: { id: { in: orgIds } } } }
            );
          }
          if (classIds.length > 0) {
            managerScopeConditions.push(
              { joinedClasses: { some: { id: { in: classIds } } } },
              { mentoredClasses: { some: { id: { in: classIds } } } }
            );
          }

          if (managerScopeConditions.length > 0) {
            andConditions.push({ OR: managerScopeConditions });
          }
        }
      }

      // Search filter
      if (search) {
        andConditions.push({
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        });
      }

      // Role filter
      if (roles && roles.length > 0) {
        where.roles = { hasSome: roles };
      }

      // Organization filter
      if (organizationId) {
        andConditions.push({
          OR: [
            { managedOrgs: { some: { id: organizationId } } },
            { memberOrgs: { some: { id: organizationId } } },
          ],
        });
      }

      // Class filter
      if (classId) {
        andConditions.push({
          OR: [
            { joinedClasses: { some: { id: classId } } },
            { mentoredClasses: { some: { id: classId } } },
          ],
        });
      }

      // Active filter
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Combine all AND conditions
      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      // Build orderBy - validate sortBy field
      const validSortFields = ['createdAt', 'updatedAt', 'name', 'email'];
      const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const orderBy: Prisma.UserOrderByWithRelationInput = {};
      orderBy[safeSortBy] = sortOrder;

      const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          gender: true,
          avatarUrl: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in findAllFiltered:', error);
      throw error;
    }
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getUserDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        joinedClasses: {
          select: {
            id: true,
            name: true,
            code: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        mentoredClasses: {
          select: {
            id: true,
            name: true,
            code: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        managedOrgs: {
          select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
          },
        },
        memberOrgs: {
          select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
          },
        },
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
              },
            },
          },
          take: 10,
          orderBy: {
            enrolledAt: 'desc',
          },
        },
        mentorProfile: true,
        menteeProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updateData: any = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async updateRoles(id: string, updateRolesDto: UpdateRolesDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        roles: updateRolesDto.roles,
      },
    });
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  findMentors() {
    return this.prisma.user.findMany({
      where: {
        roles: { has: 'MENTOR' },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        roles: true,
      },
    });
  }

  async findByOrganization(organizationId: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { managedOrgs: { some: { id: organizationId } } },
          { memberOrgs: { some: { id: organizationId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        avatarUrl: true,
        isActive: true,
      },
    });
  }

  async findByClass(classId: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { joinedClasses: { some: { id: classId } } },
          { mentoredClasses: { some: { id: classId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        avatarUrl: true,
        isActive: true,
      },
    });
  }

  async getUsersForManager(managerId: string) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: {
        managedOrgs: { select: { id: true } },
        memberOrgs: { select: { id: true } },
        mentoredClasses: { select: { id: true } },
      },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    const orgIds = [
      ...manager.managedOrgs.map(org => org.id),
      ...manager.memberOrgs.map(org => org.id),
    ];
    const classIds = manager.mentoredClasses.map(cls => cls.id);

    return this.prisma.user.findMany({
      where: {
        OR: [
          { managedOrgs: { some: { id: { in: orgIds } } } },
          { memberOrgs: { some: { id: { in: orgIds } } } },
          { joinedClasses: { some: { id: { in: classIds } } } },
          { mentoredClasses: { some: { id: { in: classIds } } } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async getUserStats(managerId?: string) {
    let where: Prisma.UserWhereInput = {};

    // If managerId provided, scope to manager's orgs and classes
    if (managerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: managerId },
        include: {
          managedOrgs: { select: { id: true } },
          memberOrgs: { select: { id: true } },
          mentoredClasses: { select: { id: true } },
        },
      });

      if (manager) {
        const orgIds = [
          ...manager.managedOrgs.map(org => org.id),
          ...manager.memberOrgs.map(org => org.id),
        ];
        const classIds = manager.mentoredClasses.map(cls => cls.id);

        where.OR = [
          { managedOrgs: { some: { id: { in: orgIds } } } },
          { memberOrgs: { some: { id: { in: orgIds } } } },
          { joinedClasses: { some: { id: { in: classIds } } } },
          { mentoredClasses: { some: { id: { in: classIds } } } },
        ];
      }
    }

    const [
      total,
      active,
      inactive,
      mentors,
      managers,
      mentees,
    ] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, isActive: true } }),
      this.prisma.user.count({ where: { ...where, isActive: false } }),
      this.prisma.user.count({ where: { ...where, roles: { has: 'MENTOR' } } }),
      this.prisma.user.count({ where: { ...where, roles: { has: 'MANAGER' } } }),
      this.prisma.user.count({ where: { ...where, roles: { has: 'MENTEE' } } }),
    ]);

    return {
      total,
      active,
      inactive,
      byRole: {
        mentors,
        managers,
        mentees,
      },
    };
  }
}
