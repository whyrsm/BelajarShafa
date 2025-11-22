import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { SessionsModule } from './sessions/sessions.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [AuthModule, UsersModule, ClassesModule, SessionsModule, AttendanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
