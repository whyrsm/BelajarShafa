import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class AssignMentorsDto {
    @IsArray()
    @IsUUID('4', { each: true })
    @IsNotEmpty()
    mentorIds: string[];
}

