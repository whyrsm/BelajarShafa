import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsArray, ArrayMinSize, Matches } from 'class-validator';
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

    @IsString()
    @IsNotEmpty({ message: 'WhatsApp number is required' })
    @Matches(/^(\+62|62|0)[0-9]{9,12}$/, {
        message: 'WhatsApp number must be in valid format (e.g., +6281234567890, 6281234567890, or 081234567890)'
    })
    whatsappNumber: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'At least one role is required' })
    @IsEnum(UserRole, { each: true })
    roles: UserRole[];

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;
}
