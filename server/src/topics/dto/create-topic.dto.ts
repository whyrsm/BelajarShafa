import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsBoolean, IsUUID, MinLength } from 'class-validator';

export class CreateTopicDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  sequence?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedDuration?: number;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;
}

