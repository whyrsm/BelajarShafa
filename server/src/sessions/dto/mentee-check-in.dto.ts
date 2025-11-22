import { IsUUID } from 'class-validator';

export class MenteeCheckInDto {
  @IsUUID()
  sessionId: string;
}

