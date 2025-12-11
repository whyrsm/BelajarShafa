import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsArray, ArrayMinSize } from 'class-validator';
import { UserRole, Gender } from '@prisma/client';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'At least one role is required' })
    @IsEnum(UserRole, { each: true })
    roles: UserRole[];

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;
}
