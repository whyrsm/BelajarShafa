import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController, SessionsDetailController } from './sessions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SessionsController, SessionsDetailController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}

