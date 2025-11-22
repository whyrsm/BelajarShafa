import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  AttendanceController,
  AttendanceDetailController,
  ClassAttendanceController,
} from './attendance.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController, AttendanceDetailController, ClassAttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}

