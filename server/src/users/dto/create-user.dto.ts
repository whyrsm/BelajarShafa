import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
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

    @IsEnum(UserRole)
    role: UserRole;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;
}
