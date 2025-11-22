import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { MenteeCheckInDto } from '../sessions/dto/mentee-check-in.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post(':sessionId/check-in')
  @UseGuards(RolesGuard)
  @Roles('MENTEE')
  checkIn(@Param('sessionId') sessionId: string, @Request() req) {
    return this.attendanceService.checkIn(sessionId, req.user.userId, req.user.role);
  }

  @Post(':sessionId/attendance')
  @UseGuards(RolesGuard)
  @Roles('MENTOR', 'MANAGER', 'ADMIN')
  bulkMarkAttendance(
    @Param('sessionId') sessionId: string,
    @Body() bulkAttendanceDto: BulkAttendanceDto,
    @Request() req,
  ) {
    return this.attendanceService.bulkMarkAttendance(
      sessionId,
      bulkAttendanceDto,
      req.user.userId,
      req.user.role,
    );
  }
}

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceDetailController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('MENTOR', 'MANAGER', 'ADMIN')
  updateAttendance(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @Request() req,
  ) {
    return this.attendanceService.updateAttendance(
      id,
      updateAttendanceDto,
      req.user.userId,
      req.user.role,
    );
  }
}

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get(':classId/attendance')
  getClassAttendanceHistory(@Param('classId') classId: string, @Request() req) {
    return this.attendanceService.getClassAttendanceHistory(
      classId,
      req.user.userId,
      req.user.role,
    );
  }
}

