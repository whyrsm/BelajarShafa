import { IsArray, IsUUID, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MaterialReorderItem {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(1)
  sequence: number;
}

export class ReorderMaterialsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialReorderItem)
  materials: MaterialReorderItem[];
}

