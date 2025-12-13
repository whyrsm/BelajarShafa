import { IsArray, ArrayMinSize, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateRolesDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one role is required' })
    @IsEnum(UserRole, { each: true })
    roles: UserRole[];
}


