import { IsInt, Min, Max, IsOptional, IsBoolean } from 'class-validator';

export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  watchedDuration?: number; // in seconds

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

