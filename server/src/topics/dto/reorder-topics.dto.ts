import { IsArray, IsUUID, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TopicReorderItem {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(1)
  sequence: number;
}

export class ReorderTopicsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicReorderItem)
  topics: TopicReorderItem[];
}

