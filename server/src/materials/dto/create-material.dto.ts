import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, IsUUID, MinLength, IsObject, ValidateIf } from 'class-validator';

export enum MaterialType {
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  ARTICLE = 'ARTICLE',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

export class CreateMaterialDto {
  @IsUUID()
  @IsNotEmpty()
  topicId: string;

  @IsEnum(MaterialType)
  @IsNotEmpty()
  type: MaterialType;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  sequence?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedDuration?: number;

  // Content structure varies by type
  @IsObject()
  @IsNotEmpty()
  content: {
    // For VIDEO
    videoUrl?: string;
    // For DOCUMENT
    documentUrl?: string;
    fileName?: string;
    fileSize?: number;
    // For ARTICLE
    articleContent?: string;
    // For EXTERNAL_LINK
    externalUrl?: string;
  };
}

