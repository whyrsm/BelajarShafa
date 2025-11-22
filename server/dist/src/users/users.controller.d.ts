import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        gender: import(".prisma/client").$Enums.Gender | null;
        id: string;
        avatarUrl: string | null;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        gender: import(".prisma/client").$Enums.Gender | null;
        id: string;
        avatarUrl: string | null;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findMentors(): import(".prisma/client").Prisma.PrismaPromise<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        gender: import(".prisma/client").$Enums.Gender | null;
        id: string;
        avatarUrl: string | null;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, null, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateUserDto: UpdateUserDto): import(".prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        gender: import(".prisma/client").$Enums.Gender | null;
        id: string;
        avatarUrl: string | null;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        gender: import(".prisma/client").$Enums.Gender | null;
        id: string;
        avatarUrl: string | null;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
