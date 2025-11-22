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
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';

@Controller('classes/:classId/sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'MENTOR')
  create(
    @Param('classId') classId: string,
    @Body() createSessionDto: CreateSessionDto,
    @Request() req,
  ) {
    return this.sessionsService.create(
      classId,
      createSessionDto,
      req.user.userId,
      req.user.role,
    );
  }

  @Get()
  findAll(@Param('classId') classId: string, @Request() req) {
    return this.sessionsService.findAll(classId, req.user.userId, req.user.role);
  }
}

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsDetailController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.sessionsService.findOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'MENTOR')
  update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
    @Request() req,
  ) {
    return this.sessionsService.update(id, updateSessionDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'MENTOR')
  remove(@Param('id') id: string, @Request() req) {
    return this.sessionsService.remove(id, req.user.userId, req.user.role);
  }
}

