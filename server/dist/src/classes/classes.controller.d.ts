import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JoinClassDto } from './dto/join-class.dto';
import { AssignMentorsDto } from './dto/assign-mentors.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    create(createClassDto: CreateClassDto, req: any): Promise<{
        organization: {
            name: string;
            id: string;
        };
        mentors: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
        mentees: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        organizationId: string | null;
        code: string;
    }>;
    findAll(req: any): Promise<any>;
    findOne(id: string, req: any): Promise<{
        organization: {
            name: string;
            id: string;
        };
        mentors: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
        mentees: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        organizationId: string | null;
        code: string;
    }>;
    update(id: string, updateClassDto: UpdateClassDto, req: any): Promise<{
        organization: {
            name: string;
            id: string;
        };
        mentors: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
        mentees: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        organizationId: string | null;
        code: string;
    }>;
    remove(id: string, req: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        organizationId: string | null;
        code: string;
    }>;
    joinByCode(joinClassDto: JoinClassDto, req: any): Promise<{
        organization: {
            name: string;
            id: string;
        };
        mentors: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
        mentees: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        organizationId: string | null;
        code: string;
    }>;
    leaveClass(id: string, req: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        organizationId: string | null;
        code: string;
    }>;
    assignMentors(id: string, assignMentorsDto: AssignMentorsDto, req: any): Promise<{
        organization: {
            name: string;
            id: string;
        };
        mentors: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
        mentees: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        organizationId: string | null;
        code: string;
    }>;
    removeMentee(id: string, menteeId: string, req: any): Promise<{
        mentors: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
        mentees: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        organizationId: string | null;
        code: string;
    }>;
}
