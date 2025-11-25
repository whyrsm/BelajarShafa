import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ReorderTopicsDto } from './dto/reorder-topics.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  create(@Body() createTopicDto: CreateTopicDto, @Request() req) {
    return this.topicsService.create(createTopicDto, req.user.userId, req.user.role);
  }

  @Get('course/:courseId')
  findAll(@Param('courseId') courseId: string) {
    return this.topicsService.findAll(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto, @Request() req) {
    return this.topicsService.update(id, updateTopicDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  remove(@Param('id') id: string, @Request() req) {
    return this.topicsService.remove(id, req.user.userId, req.user.role);
  }

  @Patch('reorder/:courseId')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  reorder(@Param('courseId') courseId: string, @Body() reorderDto: ReorderTopicsDto, @Request() req) {
    return this.topicsService.reorder(courseId, reorderDto, req.user.userId, req.user.role);
  }
}

