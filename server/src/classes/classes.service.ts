import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JoinClassDto } from './dto/join-class.dto';
import { AssignMentorsDto } from './dto/assign-mentors.dto';

@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate a unique 8-character alphanumeric class code
     */
    private async generateUniqueCode(): Promise<string> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code: string;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            code = '';
            for (let i = 0; i < 8; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            const existing = await this.prisma.class.findUnique({
                where: { code: code.toUpperCase() },
            });

            if (!existing) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new BadRequestException('Failed to generate unique class code. Please try again.');
        }

        return code.toUpperCase();
    }

    /**
     * Create a new class
     */
    async create(createClassDto: CreateClassDto, userId: string, userRoles: string[]) {
        // Support both roles array and single role (backward compatibility)
        // Handle empty array and undefined cases
        let roles: string[] = [];
        if (Array.isArray(userRoles)) {
            roles = userRoles.filter(role => role); // Remove any falsy values
        } else if (userRoles) {
            roles = [userRoles];
        }
        
        // Only Manager and Mentor can create classes
        const hasPermission = roles.includes('MANAGER') || roles.includes('MENTOR');
        if (!hasPermission) {
            throw new ForbiddenException('Only Managers and Mentors can create classes');
        }

        // If creator is a MENTOR, automatically include them in mentorIds (avoid duplicates)
        let mentorIds = [...createClassDto.mentorIds];
        if (roles.includes('MENTOR') && !mentorIds.includes(userId)) {
            mentorIds.push(userId);
        }

        // Validate mentor IDs exist and are actually mentors
        const mentors = await this.prisma.user.findMany({
            where: {
                id: { in: mentorIds },
                roles: { has: 'MENTOR' },
            },
        });

        if (mentors.length !== mentorIds.length) {
            throw new BadRequestException('One or more mentor IDs are invalid');
        }

        // Get or determine organizationId (optional)
        let organizationId = createClassDto.organizationId;
        
        if (!organizationId) {
            // If not provided, try to get user's organization
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    managedOrgs: true,
                    memberOrgs: true,
                },
            });

            if (user) {
                // Prefer managed organization, fallback to member organization
                if (user.managedOrgs.length > 0) {
                    organizationId = user.managedOrgs[0].id;
                } else if (user.memberOrgs.length > 0) {
                    organizationId = user.memberOrgs[0].id;
                }
            }
            // If no organization found, organizationId will be undefined (optional)
        }

        // Generate unique code
        const code = await this.generateUniqueCode();

        // Create class with mentors
        const classData: any = {
            name: createClassDto.name,
            description: createClassDto.description,
            code,
            mentors: {
                connect: mentorIds.map(id => ({ id })),
            },
        };

        // Only include organizationId if it exists
        if (organizationId) {
            classData.organizationId = organizationId;
        }

        if (createClassDto.startDate) {
            classData.startDate = new Date(createClassDto.startDate);
        }

        if (createClassDto.endDate) {
            classData.endDate = new Date(createClassDto.endDate);
        }

        return this.prisma.class.create({
            data: classData,
            include: {
                mentors: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                mentees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Get all classes for the current user (role-based)
     */
    async findAll(userId: string, userRoles: string[]) {
        // Support both roles array and single role (backward compatibility)
        // Handle empty array and undefined cases
        let roles: string[] = [];
        if (Array.isArray(userRoles)) {
            roles = userRoles.filter(role => role); // Remove any falsy values
        } else if (userRoles) {
            roles = [userRoles];
        }
        
        const includeOptions = {
            mentors: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                },
            },
            mentees: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                },
            },
            organization: {
                select: {
                    id: true,
                    name: true,
                },
            },
            sessions: {
                select: {
                    id: true,
                    title: true,
                    startTime: true,
                    endTime: true,
                    type: true,
                },
                orderBy: {
                    startTime: Prisma.SortOrder.desc,
                },
                take: 5, // Limit to recent 5 sessions for list view
            },
            _count: {
                select: {
                    sessions: true,
                },
            },
        };

        let classes = [];

        // If user is a MANAGER, they see all classes
        if (roles.includes('MANAGER')) {
            classes = await this.prisma.class.findMany({
                include: includeOptions,
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } else {
            // Build where conditions for multiple roles
            const whereConditions: any[] = [];

            // If user is a MENTOR, include classes where they are a mentor
            if (roles.includes('MENTOR')) {
                whereConditions.push({
                    mentors: {
                        some: {
                            id: userId,
                        },
                    },
                });
            }

            // If user is a MENTEE, include classes where they are a mentee
            if (roles.includes('MENTEE')) {
                whereConditions.push({
                    mentees: {
                        some: {
                            id: userId,
                        },
                    },
                });
            }

            // If user has relevant roles, fetch classes
            if (whereConditions.length > 0) {
                classes = await this.prisma.class.findMany({
                    where: {
                        OR: whereConditions,
                    },
                    include: includeOptions,
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
            }
        }

        return classes;
    }

    /**
     * Get a single class by ID
     */
    async findOne(id: string, userId: string, userRoles: string[]) {
        // Support both roles array and single role (backward compatibility)
        // Handle empty array and undefined cases
        let roles: string[] = [];
        if (Array.isArray(userRoles)) {
            roles = userRoles.filter(role => role); // Remove any falsy values
        } else if (userRoles) {
            roles = [userRoles];
        }
        
        const classData = await this.prisma.class.findUnique({
            where: { id },
            include: {
                mentors: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                mentees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                sessions: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        attendances: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        startTime: Prisma.SortOrder.desc,
                    },
                },
                _count: {
                    select: {
                        sessions: true,
                    },
                },
            },
        });

        if (!classData) {
            throw new NotFoundException('Class not found');
        }

        // Check access permissions
        // MANAGER and ADMIN can access any class
        if (roles.includes('MANAGER') || roles.includes('ADMIN')) {
            return classData;
        }

        // Check if user is a mentor of this class
        if (roles.includes('MENTOR')) {
            const isMentor = classData.mentors.some(m => m.id === userId);
            if (isMentor) {
                return classData;
            }
        }

        // Check if user is a mentee of this class
        if (roles.includes('MENTEE')) {
            const isMentee = classData.mentees.some(m => m.id === userId);
            if (isMentee) {
                return classData;
            }
        }

        // If user has none of the above permissions, deny access
        throw new ForbiddenException('You do not have access to this class');
    }

    /**
     * Update a class
     */
    async update(id: string, updateClassDto: UpdateClassDto, userId: string, userRole: string) {
        const classData = await this.prisma.class.findUnique({
            where: { id },
            include: {
                mentors: true,
            },
        });

        if (!classData) {
            throw new NotFoundException('Class not found');
        }

        // Check permissions: Manager or assigned Mentor
        if (userRole === 'MENTOR') {
            const isMentor = classData.mentors.some(m => m.id === userId);
            if (!isMentor) {
                throw new ForbiddenException('Only assigned mentors can update this class');
            }
        } else if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
            throw new ForbiddenException('You do not have permission to update this class');
        }

        const updateData: any = {};

        if (updateClassDto.name) {
            updateData.name = updateClassDto.name;
        }

        if (updateClassDto.description !== undefined) {
            updateData.description = updateClassDto.description;
        }

        if (updateClassDto.startDate) {
            updateData.startDate = new Date(updateClassDto.startDate);
        }

        if (updateClassDto.endDate) {
            updateData.endDate = new Date(updateClassDto.endDate);
        }

        return this.prisma.class.update({
            where: { id },
            data: updateData,
            include: {
                mentors: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                mentees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Delete a class (Manager only)
     */
    async remove(id: string, userId: string, userRole: string) {
        if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
            throw new ForbiddenException('Only Managers can delete classes');
        }

        const classData = await this.prisma.class.findUnique({
            where: { id },
        });

        if (!classData) {
            throw new NotFoundException('Class not found');
        }

        return this.prisma.class.delete({
            where: { id },
        });
    }

    /**
     * Join a class by code (Mentee only)
     */
    async joinByCode(joinClassDto: JoinClassDto, userId: string, userRole: string) {
        if (userRole !== 'MENTEE') {
            throw new ForbiddenException('Only Mentees can join classes');
        }

        const code = joinClassDto.code.toUpperCase();
        const classData = await this.prisma.class.findUnique({
            where: { code },
            include: {
                mentees: true,
            },
        });

        if (!classData) {
            throw new NotFoundException('Class not found with the provided code');
        }

        // Check if already joined
        const alreadyJoined = classData.mentees.some(m => m.id === userId);
        if (alreadyJoined) {
            throw new BadRequestException('You are already a member of this class');
        }

        // Add mentee to class
        return this.prisma.class.update({
            where: { id: classData.id },
            data: {
                mentees: {
                    connect: { id: userId },
                },
            },
            include: {
                mentors: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                mentees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Leave a class (Mentee only)
     */
    async leaveClass(id: string, userId: string, userRole: string) {
        if (userRole !== 'MENTEE') {
            throw new ForbiddenException('Only Mentees can leave classes');
        }

        const classData = await this.prisma.class.findUnique({
            where: { id },
            include: {
                mentees: true,
            },
        });

        if (!classData) {
            throw new NotFoundException('Class not found');
        }

        const isMentee = classData.mentees.some(m => m.id === userId);
        if (!isMentee) {
            throw new BadRequestException('You are not a member of this class');
        }

        return this.prisma.class.update({
            where: { id },
            data: {
                mentees: {
                    disconnect: { id: userId },
                },
            },
        });
    }

    /**
     * Assign mentors to a class (Manager only)
     */
    async assignMentors(id: string, assignMentorsDto: AssignMentorsDto, userId: string, userRole: string) {
        if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
            throw new ForbiddenException('Only Managers can assign mentors');
        }

        const classData = await this.prisma.class.findUnique({
            where: { id },
        });

        if (!classData) {
            throw new NotFoundException('Class not found');
        }

        // Validate mentor IDs
        const mentors = await this.prisma.user.findMany({
            where: {
                id: { in: assignMentorsDto.mentorIds },
                roles: { has: 'MENTOR' },
            },
        });

        if (mentors.length !== assignMentorsDto.mentorIds.length) {
            throw new BadRequestException('One or more mentor IDs are invalid');
        }

        return this.prisma.class.update({
            where: { id },
            data: {
                mentors: {
                    set: assignMentorsDto.mentorIds.map(mentorId => ({ id: mentorId })),
                },
            },
            include: {
                mentors: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                mentees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Remove a mentee from a class (Mentor only)
     */
    async removeMentee(classId: string, menteeId: string, userId: string, userRole: string) {
        if (userRole !== 'MENTOR' && userRole !== 'MANAGER' && userRole !== 'ADMIN') {
            throw new ForbiddenException('Only Mentors and Managers can remove mentees');
        }

        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
            include: {
                mentors: true,
            },
        });

        if (!classData) {
            throw new NotFoundException('Class not found');
        }

        // If Mentor, check if they are assigned to this class
        if (userRole === 'MENTOR') {
            const isMentor = classData.mentors.some(m => m.id === userId);
            if (!isMentor) {
                throw new ForbiddenException('You are not assigned to this class');
            }
        }

        return this.prisma.class.update({
            where: { id: classId },
            data: {
                mentees: {
                    disconnect: { id: menteeId },
                },
            },
            include: {
                mentors: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                mentees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
}

