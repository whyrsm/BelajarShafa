import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';
import { UploadService } from './upload.service';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER', 'ADMIN')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: UploadedFile, @Request() req) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const result = await this.uploadService.uploadFile({
        originalname: file.originalname,
        size: file.size,
        buffer: file.buffer,
        mimetype: file.mimetype,
      });
      return {
        success: true,
        data: {
          documentUrl: result.url,
          fileName: result.filename,
          fileSize: result.size,
          key: result.key,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to upload file');
    }
  }
}


