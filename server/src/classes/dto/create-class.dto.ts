import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString, IsUUID, MinLength } from 'class-validator';

export class CreateClassDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsArray()
    @IsUUID('4', { each: true })
    @IsNotEmpty()
    mentorIds: string[];

    @IsString()
    @IsOptional()
    organizationId?: string;
}

