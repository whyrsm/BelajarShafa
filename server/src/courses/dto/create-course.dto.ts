import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, IsUUID, MinLength } from 'class-validator';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum CourseType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsEnum(CourseLevel)
  @IsNotEmpty()
  level: CourseLevel;

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedDuration?: number;

  @IsString()
  @IsOptional()
  prerequisites?: string;

  @IsEnum(CourseType)
  @IsNotEmpty()
  type: CourseType;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}

