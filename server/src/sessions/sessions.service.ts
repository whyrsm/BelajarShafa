import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session
   */
  async create(classId: string, createSessionDto: CreateSessionDto, userId: string, userRole: string) {
    // Only Manager and Mentor can create sessions
    if (userRole !== 'MANAGER' && userRole !== 'MENTOR') {
      throw new ForbiddenException('Only Managers and Mentors can create sessions');
    }

    // Verify class exists and user has access
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        mentors: true,
      },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    // Check if user is a mentor assigned to this class or a manager
    if (userRole === 'MENTOR') {
      const isMentor = classData.mentors.some(m => m.id === userId);
      if (!isMentor) {
        throw new ForbiddenException('You are not assigned to this class');
      }
    }

    // Validate endTime is after startTime if provided
    const startTime = new Date(createSessionDto.startTime);
    if (createSessionDto.endTime) {
      const endTime = new Date(createSessionDto.endTime);
      if (endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    // Validate type-specific fields
    if (createSessionDto.type === 'ONLINE' && !createSessionDto.meetingUrl) {
      throw new BadRequestException('Meeting URL is required for online sessions');
    }
    if (createSessionDto.type === 'OFFLINE' && !createSessionDto.location) {
      throw new BadRequestException('Location is required for offline sessions');
    }

    const checkInWindowMinutes = createSessionDto.checkInWindowMinutes ?? 15;

    return this.prisma.session.create({
      data: {
        title: createSessionDto.title,
        description: createSessionDto.description,
        startTime,
        endTime: createSessionDto.endTime ? new Date(createSessionDto.endTime) : null,
        type: createSessionDto.type,
        location: createSessionDto.location,
        meetingUrl: createSessionDto.meetingUrl,
        checkInWindowMinutes: checkInWindowMinutes,
        checkInCloseMinutes: 30, // Default 30 minutes after start
        classId,
        createdBy: userId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
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
    });
  }

  /**
   * Get all sessions for a class
   */
  async findAll(classId: string, userId: string, userRole: string) {
    // Verify class exists and user has access
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        mentors: true,
        mentees: true,
      },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    // Check access permissions
    if (userRole === 'MENTOR') {
      const isMentor = classData.mentors.some(m => m.id === userId);
      if (!isMentor) {
        throw new ForbiddenException('You do not have access to this class');
      }
    } else if (userRole === 'MENTEE') {
      const isMentee = classData.mentees.some(m => m.id === userId);
      if (!isMentee) {
        throw new ForbiddenException('You do not have access to this class');
      }
    }
    // MANAGER and ADMIN can access any class

    return this.prisma.session.findMany({
      where: { classId },
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
        startTime: 'desc',
      },
    });
  }

  /**
   * Get a single session by ID
   */
  async findOne(id: string, userId: string, userRole: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            mentors: true,
            mentees: true,
          },
        },
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
            marker: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check access permissions
    const classData = session.class;
    if (userRole === 'MENTOR') {
      const isMentor = classData.mentors.some(m => m.id === userId);
      if (!isMentor) {
        throw new ForbiddenException('You do not have access to this session');
      }
    } else if (userRole === 'MENTEE') {
      const isMentee = classData.mentees.some(m => m.id === userId);
      if (!isMentee) {
        throw new ForbiddenException('You do not have access to this session');
      }
    }
    // MANAGER and ADMIN can access any session

    return session;
  }

  /**
   * Update a session
   */
  async update(id: string, updateSessionDto: UpdateSessionDto, userId: string, userRole: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            mentors: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check permissions: Manager or assigned Mentor or creator
    if (userRole === 'MENTOR') {
      const isMentor = session.class.mentors.some(m => m.id === userId);
      const isCreator = session.createdBy === userId;
      if (!isMentor && !isCreator) {
        throw new ForbiddenException('Only assigned mentors or session creator can update this session');
      }
    } else if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to update this session');
    }

    const updateData: any = {};

    if (updateSessionDto.title) {
      updateData.title = updateSessionDto.title;
    }
    if (updateSessionDto.description !== undefined) {
      updateData.description = updateSessionDto.description;
    }
    if (updateSessionDto.startTime) {
      updateData.startTime = new Date(updateSessionDto.startTime);
    }
    if (updateSessionDto.endTime !== undefined) {
      updateData.endTime = updateSessionDto.endTime ? new Date(updateSessionDto.endTime) : null;
    }
    if (updateSessionDto.type) {
      updateData.type = updateSessionDto.type;
    }
    if (updateSessionDto.location !== undefined) {
      updateData.location = updateSessionDto.location;
    }
    if (updateSessionDto.meetingUrl !== undefined) {
      updateData.meetingUrl = updateSessionDto.meetingUrl;
    }
    if (updateSessionDto.checkInWindowMinutes !== undefined) {
      updateData.checkInWindowMinutes = updateSessionDto.checkInWindowMinutes;
    }

    // Validate endTime is after startTime if both are being updated
    if (updateData.startTime && updateData.endTime) {
      if (updateData.endTime <= updateData.startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    } else if (updateData.startTime && session.endTime) {
      if (session.endTime <= updateData.startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    } else if (updateData.endTime && session.startTime) {
      if (updateData.endTime <= session.startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    return this.prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
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
    });
  }

  /**
   * Delete a session (Manager or creator only)
   */
  async remove(id: string, userId: string, userRole: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Only Manager, Admin, or creator can delete
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN' && session.createdBy !== userId) {
      throw new ForbiddenException('Only Managers, Admins, or session creator can delete sessions');
    }

    return this.prisma.session.delete({
      where: { id },
    });
  }
}

