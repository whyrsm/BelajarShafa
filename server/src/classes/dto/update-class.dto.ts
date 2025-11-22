import { PartialType } from '@nestjs/mapped-types';
import { CreateClassDto } from './create-class.dto';
import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';

export class UpdateClassDto extends PartialType(CreateClassDto) {
    @IsString()
    @IsOptional()
    @MinLength(3)
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;
}

