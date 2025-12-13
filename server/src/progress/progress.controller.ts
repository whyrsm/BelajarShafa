import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Patch('material/:materialId')
  updateMaterialProgress(
    @Param('materialId') materialId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Request() req,
  ) {
    return this.progressService.updateMaterialProgress(
      materialId,
      req.user.userId,
      updateProgressDto,
    );
  }

  @Get('material/:materialId')
  getMaterialProgress(@Param('materialId') materialId: string, @Request() req) {
    return this.progressService.getMaterialProgress(materialId, req.user.userId);
  }

  @Post('material/:materialId/complete')
  markMaterialComplete(@Param('materialId') materialId: string, @Request() req) {
    return this.progressService.markMaterialComplete(materialId, req.user.userId);
  }

  @Get('topic/:topicId')
  getTopicProgress(@Param('topicId') topicId: string, @Request() req) {
    return this.progressService.getTopicProgress(topicId, req.user.userId);
  }
}



