import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JoinClassDto } from './dto/join-class.dto';
import { AssignMentorsDto } from './dto/assign-mentors.dto';
export declare class ClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateUniqueCode;
    create(createClassDto: CreateClassDto, userId: string, userRole: string): Promise<{
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
    findAll(userId: string, userRole: string): Promise<any>;
    findOne(id: string, userId: string, userRole: string): Promise<{
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
    update(id: string, updateClassDto: UpdateClassDto, userId: string, userRole: string): Promise<{
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
    remove(id: string, userId: string, userRole: string): Promise<{
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
    joinByCode(joinClassDto: JoinClassDto, userId: string, userRole: string): Promise<{
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
    leaveClass(id: string, userId: string, userRole: string): Promise<{
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
    assignMentors(id: string, assignMentorsDto: AssignMentorsDto, userId: string, userRole: string): Promise<{
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
    removeMentee(classId: string, menteeId: string, userId: string, userRole: string): Promise<{
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
