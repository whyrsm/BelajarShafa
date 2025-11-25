import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.coursesService.create(
      createCourseDto,
      req.user.userId,
      req.user.role,
    );
  }

  @Get()
  findAll(@Query() filters: CourseFilterDto) {
    return this.coursesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.coursesService.getStats(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
  ) {
    return this.coursesService.update(id, updateCourseDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  remove(@Param('id') id: string, @Request() req) {
    return this.coursesService.remove(id, req.user.userId, req.user.role);
  }

  @Post(':id/duplicate')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  duplicate(@Param('id') id: string, @Request() req) {
    return this.coursesService.duplicate(id, req.user.userId, req.user.role);
  }
}

