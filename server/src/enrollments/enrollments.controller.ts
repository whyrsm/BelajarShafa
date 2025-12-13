import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@Body() enrollCourseDto: EnrollCourseDto, @Request() req) {
    return this.enrollmentsService.enroll(enrollCourseDto.courseId, req.user.userId);
  }

  @Get('my-courses')
  getMyEnrollments(@Request() req) {
    return this.enrollmentsService.getMyEnrollments(req.user.userId);
  }

  @Get('course/:courseId')
  getCourseEnrollment(@Param('courseId') courseId: string, @Request() req) {
    return this.enrollmentsService.getCourseEnrollment(courseId, req.user.userId);
  }

  @Delete('course/:courseId')
  unenroll(@Param('courseId') courseId: string, @Request() req) {
    return this.enrollmentsService.unenroll(courseId, req.user.userId);
  }

  @Post('course/:courseId/complete')
  markCourseCompleted(@Param('courseId') courseId: string, @Request() req) {
    return this.enrollmentsService.markCourseCompleted(courseId, req.user.userId);
  }
}



