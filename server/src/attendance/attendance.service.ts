import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mentee self check-in
   */
  async checkIn(sessionId: string, userId: string, userRole: string) {
    if (userRole !== 'MENTEE') {
      throw new ForbiddenException('Only Mentees can check in');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            mentees: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify mentee is in the class
    const isMentee = session.class.mentees.some(m => m.id === userId);
    if (!isMentee) {
      throw new ForbiddenException('You are not a member of this class');
    }

    // Check if already checked in
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('You have already checked in for this session');
    }

    // Validate check-in window
    const now = new Date();
    const startTime = new Date(session.startTime);
    const checkInWindowStart = new Date(startTime.getTime() - session.checkInWindowMinutes * 60 * 1000);
    const checkInWindowEnd = new Date(startTime.getTime() + session.checkInCloseMinutes * 60 * 1000);

    if (now < checkInWindowStart) {
      const minutesUntilWindow = Math.ceil((checkInWindowStart.getTime() - now.getTime()) / (60 * 1000));
      throw new BadRequestException(
        `Check-in window opens ${minutesUntilWindow} minute(s) before the session starts`,
      );
    }

    if (now > checkInWindowEnd) {
      throw new BadRequestException('Check-in window has closed');
    }

    // Create attendance record
    return this.prisma.attendance.create({
      data: {
        sessionId,
        userId,
        status: 'PRESENT',
        checkInTime: now,
        markedBy: userId, // Self-check-in
      },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Mentor bulk mark attendance
   */
  async bulkMarkAttendance(
    sessionId: string,
    bulkAttendanceDto: BulkAttendanceDto,
    userId: string,
    userRole: string,
  ) {
    if (userRole !== 'MENTOR' && userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Mentors and Managers can mark attendance');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            mentors: true,
            mentees: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if user is a mentor assigned to this class or a manager
    if (userRole === 'MENTOR') {
      const isMentor = session.class.mentors.some(m => m.id === userId);
      if (!isMentor) {
        throw new ForbiddenException('You are not assigned to this class');
      }
    }

    // Validate all mentee IDs are in the class
    const menteeIds = bulkAttendanceDto.records.map(r => r.menteeId);
    const validMentees = session.class.mentees.filter(m => menteeIds.includes(m.id));
    if (validMentees.length !== menteeIds.length) {
      throw new BadRequestException('One or more mentee IDs are not members of this class');
    }

    // Create or update attendance records
    const results = await Promise.all(
      bulkAttendanceDto.records.map(record =>
        this.prisma.attendance.upsert({
          where: {
            sessionId_userId: {
              sessionId,
              userId: record.menteeId,
            },
          },
          create: {
            sessionId,
            userId: record.menteeId,
            status: record.status,
            notes: record.notes,
            markedBy: userId,
          },
          update: {
            status: record.status,
            notes: record.notes,
            markedBy: userId,
          },
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
        }),
      ),
    );

    return results;
  }

  /**
   * Update attendance record (mentor can override)
   */
  async updateAttendance(
    id: string,
    updateAttendanceDto: UpdateAttendanceDto,
    userId: string,
    userRole: string,
  ) {
    if (userRole !== 'MENTOR' && userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only Mentors and Managers can update attendance');
    }

    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        session: {
          include: {
            class: {
              include: {
                mentors: true,
              },
            },
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    // Check if user is a mentor assigned to this class or a manager
    if (userRole === 'MENTOR') {
      const isMentor = attendance.session.class.mentors.some(m => m.id === userId);
      if (!isMentor) {
        throw new ForbiddenException('You are not assigned to this class');
      }
    }

    const updateData: any = {};
    if (updateAttendanceDto.status !== undefined) {
      updateData.status = updateAttendanceDto.status;
    }
    if (updateAttendanceDto.notes !== undefined) {
      updateData.notes = updateAttendanceDto.notes;
    }
    updateData.markedBy = userId;

    return this.prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        session: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
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
    });
  }

  /**
   * Get attendance history for a class (individual mentee attendance across all sessions)
   */
  async getClassAttendanceHistory(classId: string, userId: string, userRole: string) {
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

    // Get all sessions for this class
    const sessions = await this.prisma.session.findMany({
      where: { classId },
      orderBy: {
        startTime: 'desc',
      },
      include: {
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

    // If mentee, only return their own attendance
    if (userRole === 'MENTEE') {
      const menteeSessions = sessions.map(session => ({
        session: {
          id: session.id,
          title: session.title,
          startTime: session.startTime,
          endTime: session.endTime,
        },
        attendance: session.attendances.find(a => a.userId === userId) || null,
      }));

      const totalSessions = sessions.length;
      const presentCount = menteeSessions.filter(s => s.attendance?.status === 'PRESENT').length;
      const absentCount = menteeSessions.filter(s => s.attendance?.status === 'ABSENT').length;
      const permitCount = menteeSessions.filter(s => s.attendance?.status === 'PERMIT').length;
      const sickCount = menteeSessions.filter(s => s.attendance?.status === 'SICK').length;
      const noRecordCount = menteeSessions.filter(s => !s.attendance).length;

      return {
        menteeId: userId,
        totalSessions,
        statistics: {
          present: presentCount,
          absent: absentCount,
          permit: permitCount,
          sick: sickCount,
          noRecord: noRecordCount,
          attendanceRate: totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0,
        },
        history: menteeSessions,
      };
    }

    // For mentors/managers, return all mentees' attendance
    const menteeAttendanceMap = new Map<string, any>();

    classData.mentees.forEach(mentee => {
      const menteeSessions = sessions.map(session => ({
        session: {
          id: session.id,
          title: session.title,
          startTime: session.startTime,
          endTime: session.endTime,
        },
        attendance: session.attendances.find(a => a.userId === mentee.id) || null,
      }));

      const totalSessions = sessions.length;
      const presentCount = menteeSessions.filter(s => s.attendance?.status === 'PRESENT').length;
      const absentCount = menteeSessions.filter(s => s.attendance?.status === 'ABSENT').length;
      const permitCount = menteeSessions.filter(s => s.attendance?.status === 'PERMIT').length;
      const sickCount = menteeSessions.filter(s => s.attendance?.status === 'SICK').length;
      const noRecordCount = menteeSessions.filter(s => !s.attendance).length;

      menteeAttendanceMap.set(mentee.id, {
        mentee: {
          id: mentee.id,
          name: mentee.name,
          email: mentee.email,
          avatarUrl: mentee.avatarUrl,
        },
        totalSessions,
        statistics: {
          present: presentCount,
          absent: absentCount,
          permit: permitCount,
          sick: sickCount,
          noRecord: noRecordCount,
          attendanceRate: totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0,
        },
        history: menteeSessions,
      });
    });

    return {
      classId,
      totalSessions: sessions.length,
      mentees: Array.from(menteeAttendanceMap.values()),
    };
  }
}

