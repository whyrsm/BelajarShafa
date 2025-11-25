import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { SessionsModule } from './sessions/sessions.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CategoriesModule } from './categories/categories.module';
import { CoursesModule } from './courses/courses.module';
import { TopicsModule } from './topics/topics.module';
import { MaterialsModule } from './materials/materials.module';

@Module({
  imports: [AuthModule, UsersModule, ClassesModule, SessionsModule, AttendanceModule, CategoriesModule, CoursesModule, TopicsModule, MaterialsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
