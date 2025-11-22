import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class JoinClassDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z0-9]{6,8}$/i, {
        message: 'Class code must be 6-8 alphanumeric characters',
    })
    code: string;
}

