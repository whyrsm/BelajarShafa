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
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ReorderMaterialsDto } from './dto/reorder-materials.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  create(@Body() createMaterialDto: CreateMaterialDto, @Request() req) {
    return this.materialsService.create(createMaterialDto, req.user.userId, req.user.role);
  }

  @Get('topic/:topicId')
  findAll(@Param('topicId') topicId: string) {
    return this.materialsService.findAll(topicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto, @Request() req) {
    return this.materialsService.update(id, updateMaterialDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  remove(@Param('id') id: string, @Request() req) {
    return this.materialsService.remove(id, req.user.userId, req.user.role);
  }

  @Patch('reorder/:topicId')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  reorder(@Param('topicId') topicId: string, @Body() reorderDto: ReorderMaterialsDto, @Request() req) {
    return this.materialsService.reorder(topicId, reorderDto, req.user.userId, req.user.role);
  }
}

