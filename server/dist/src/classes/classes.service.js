"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClassesService = class ClassesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateUniqueCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code;
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
            throw new common_1.BadRequestException('Failed to generate unique class code. Please try again.');
        }
        return code.toUpperCase();
    }
    async create(createClassDto, userId, userRole) {
        if (userRole !== 'MANAGER' && userRole !== 'MENTOR') {
            throw new common_1.ForbiddenException('Only Managers and Mentors can create classes');
        }
        let mentorIds = [...createClassDto.mentorIds];
        if (userRole === 'MENTOR' && !mentorIds.includes(userId)) {
            mentorIds.push(userId);
        }
        const mentors = await this.prisma.user.findMany({
            where: {
                id: { in: mentorIds },
                role: 'MENTOR',
            },
        });
        if (mentors.length !== mentorIds.length) {
            throw new common_1.BadRequestException('One or more mentor IDs are invalid');
        }
        let organizationId = createClassDto.organizationId;
        if (!organizationId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    managedOrgs: true,
                    memberOrgs: true,
                },
            });
            if (user) {
                if (user.managedOrgs.length > 0) {
                    organizationId = user.managedOrgs[0].id;
                }
                else if (user.memberOrgs.length > 0) {
                    organizationId = user.memberOrgs[0].id;
                }
            }
        }
        const code = await this.generateUniqueCode();
        const classData = {
            name: createClassDto.name,
            description: createClassDto.description,
            code,
            mentors: {
                connect: mentorIds.map(id => ({ id })),
            },
        };
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
    async findAll(userId, userRole) {
        let classes;
        if (userRole === 'MANAGER') {
            classes = await this.prisma.class.findMany({
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
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        else if (userRole === 'MENTOR') {
            classes = await this.prisma.class.findMany({
                where: {
                    mentors: {
                        some: {
                            id: userId,
                        },
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
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        else if (userRole === 'MENTEE') {
            classes = await this.prisma.class.findMany({
                where: {
                    mentees: {
                        some: {
                            id: userId,
                        },
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
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        else {
            classes = [];
        }
        return classes;
    }
    async findOne(id, userId, userRole) {
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
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        if (userRole === 'MENTOR') {
            const isMentor = classData.mentors.some(m => m.id === userId);
            if (!isMentor) {
                throw new common_1.ForbiddenException('You do not have access to this class');
            }
        }
        else if (userRole === 'MENTEE') {
            const isMentee = classData.mentees.some(m => m.id === userId);
            if (!isMentee) {
                throw new common_1.ForbiddenException('You do not have access to this class');
            }
        }
        return classData;
    }
    async update(id, updateClassDto, userId, userRole) {
        const classData = await this.prisma.class.findUnique({
            where: { id },
            include: {
                mentors: true,
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        if (userRole === 'MENTOR') {
            const isMentor = classData.mentors.some(m => m.id === userId);
            if (!isMentor) {
                throw new common_1.ForbiddenException('Only assigned mentors can update this class');
            }
        }
        else if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('You do not have permission to update this class');
        }
        const updateData = {};
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
    async remove(id, userId, userRole) {
        if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only Managers can delete classes');
        }
        const classData = await this.prisma.class.findUnique({
            where: { id },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        return this.prisma.class.delete({
            where: { id },
        });
    }
    async joinByCode(joinClassDto, userId, userRole) {
        if (userRole !== 'MENTEE') {
            throw new common_1.ForbiddenException('Only Mentees can join classes');
        }
        const code = joinClassDto.code.toUpperCase();
        const classData = await this.prisma.class.findUnique({
            where: { code },
            include: {
                mentees: true,
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found with the provided code');
        }
        const alreadyJoined = classData.mentees.some(m => m.id === userId);
        if (alreadyJoined) {
            throw new common_1.BadRequestException('You are already a member of this class');
        }
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
    async leaveClass(id, userId, userRole) {
        if (userRole !== 'MENTEE') {
            throw new common_1.ForbiddenException('Only Mentees can leave classes');
        }
        const classData = await this.prisma.class.findUnique({
            where: { id },
            include: {
                mentees: true,
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        const isMentee = classData.mentees.some(m => m.id === userId);
        if (!isMentee) {
            throw new common_1.BadRequestException('You are not a member of this class');
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
    async assignMentors(id, assignMentorsDto, userId, userRole) {
        if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only Managers can assign mentors');
        }
        const classData = await this.prisma.class.findUnique({
            where: { id },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        const mentors = await this.prisma.user.findMany({
            where: {
                id: { in: assignMentorsDto.mentorIds },
                role: 'MENTOR',
            },
        });
        if (mentors.length !== assignMentorsDto.mentorIds.length) {
            throw new common_1.BadRequestException('One or more mentor IDs are invalid');
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
    async removeMentee(classId, menteeId, userId, userRole) {
        if (userRole !== 'MENTOR' && userRole !== 'MANAGER' && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only Mentors and Managers can remove mentees');
        }
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
            include: {
                mentors: true,
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        if (userRole === 'MENTOR') {
            const isMentor = classData.mentors.some(m => m.id === userId);
            if (!isMentor) {
                throw new common_1.ForbiddenException('You are not assigned to this class');
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
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map