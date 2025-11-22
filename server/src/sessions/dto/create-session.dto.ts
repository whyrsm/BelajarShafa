import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID, IsEnum, IsInt, Min, ValidateIf } from 'class-validator';

export enum SessionType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsEnum(SessionType)
  @IsNotEmpty()
  type: SessionType;

  @ValidateIf(o => o.type === SessionType.OFFLINE)
  @IsString()
  @IsNotEmpty()
  location?: string;

  @ValidateIf(o => o.type === SessionType.ONLINE)
  @IsString()
  @IsNotEmpty()
  meetingUrl?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  checkInWindowMinutes?: number;
}

