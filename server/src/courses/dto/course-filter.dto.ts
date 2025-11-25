import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { CourseLevel, CourseType } from './create-course.dto';

export class CourseFilterDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @IsEnum(CourseType)
  @IsOptional()
  type?: CourseType;
}

