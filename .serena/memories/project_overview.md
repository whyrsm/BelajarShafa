# BelajarShafa Project Overview

## Project Purpose
Learning Management System (LMS) for mentorship-based education connecting mentees with mentors in structured classes with attendance tracking.

## Tech Stack

### Backend
- **Framework**: NestJS 10.x (TypeScript-based Node.js framework)
- **Database**: PostgreSQL with Prisma ORM (v7.x)
- **Authentication**: JWT + Passport (local & JWT strategies)
- **Password**: bcrypt for hashing
- **Validation**: class-validator and class-transformer
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 16.x with React 19
- **Styling**: TailwindCSS 4.x with custom components
- **Forms**: react-hook-form with Zod validation
- **UI Components**: Radix UI primitives
- **Icons**: lucide-react

### Project Structure
- **Monorepo**: Using npm workspaces with root package.json
- **API URL**: http://localhost:4000 (configurable via NEXT_PUBLIC_API_URL)
- **API Prefix**: All routes prefixed with /api

## Database Schema Overview

### Core Entities
1. **User** - Base user with roles (ADMIN, MANAGER, MENTOR, MENTEE)
2. **MentorProfile** - Extended mentor info (job, company, expertise, availability)
3. **MenteeProfile** - Mentee-specific data
4. **Organization** - Organization container for classes
5. **Class** - Learning group with mentors and mentees, unique code for joining
6. **Session** - Meeting/event within a class (online/offline)
7. **Attendance** - Attendance record for mentee in a session

### Key Relationships
- User -> Class: many-to-many (mentors, mentees)
- User -> Session: one-to-many (creator)
- User -> Attendance: one-to-many
- Class -> Session: one-to-many
- Session -> Attendance: one-to-many
- Organization -> Class: one-to-many
- User -> Organization: many-to-many (managers, members)

### Enums
- UserRole: ADMIN, MANAGER, MENTOR, MENTEE
- Gender: MALE, FEMALE, OTHER
- ApplicationStatus: PENDING, APPROVED, REJECTED
- AttendanceStatus: PRESENT, ABSENT, PERMIT, SICK
- SessionType: ONLINE, OFFLINE

## Authentication & Authorization Patterns

### Guards
1. **JwtAuthGuard**: Validates JWT token, extracts user info to request.user
2. **RolesGuard**: Checks user role against @Roles decorator metadata
3. **LocalAuthGuard**: Used for login with username/password

### JWT Payload
```
{
  email: string,
  sub: string (userId),
  role: UserRole
}
```

### Authorization Pattern
- Controller methods use @UseGuards(JwtAuthGuard) at class or method level
- Endpoint-specific roles: @UseGuards(RolesGuard) @Roles('MANAGER', 'MENTOR')
- User context: @Request() req where req.user contains { userId, role, email, name }

## Module Structure Pattern

### Standard Module Structure
```
module-name/
├── module-name.controller.ts    # HTTP endpoints
├── module-name.service.ts       # Business logic
├── module-name.module.ts        # Module definition
├── dto/                         # Data Transfer Objects
│   ├── create-{module}.dto.ts
│   ├── update-{module}.dto.ts
│   └── other-{module}.dto.ts
└── entities/                    # Optional entity types
    └── {module}.entity.ts
```

### Module Definition Pattern
```typescript
@Module({
  imports: [PrismaModule],        // Always imports PrismaModule
  controllers: [NameController],
  providers: [NameService],
  exports: [NameService],         // If used by other modules
})
export class NameModule { }
```

## API Pattern Conventions

### Controller Conventions
1. Use @Controller('resource-name') at class level
2. All endpoints inherit @UseGuards(JwtAuthGuard) from class
3. Use RESTful routes: POST, GET, PATCH, DELETE
4. Methods receive: @Param, @Body, @Request() req
5. Extract user from request: req.user.userId, req.user.role

### DTO Conventions
1. Use class-validator decorators: @IsString, @IsNotEmpty, @IsOptional, etc.
2. Use @IsEnum for enums, @IsUUID for IDs
3. Use @IsDateString for date inputs
4. Use @MinLength for string validation
5. Use @IsArray with @IsUUID for array of IDs

### Service Conventions
1. Constructor dependency injection: constructor(private prisma: PrismaService)
2. Permission checks first: if (userRole !== 'X') throw new ForbiddenException()
3. Resource existence checks: if (!resource) throw new NotFoundException()
4. Validation: if (invalid) throw new BadRequestException()
5. Include related data in response using Prisma's include/select
6. Select fields to return: { id, name, email, avatarUrl }

### Response Format
- Returns Prisma query results directly (automatically serialized to JSON)
- Always include related entities with select/include for client needs
- No wrapping in data/status objects at service level

## Client API Patterns

### API Client Pattern (lib/api/)
1. Define interfaces for API responses
2. Create fetchWithAuth helper for authenticated requests
3. Extract token from localStorage
4. Add Authorization header: Bearer {token}
5. Base URL: `${API_URL}/api${url}` where API_URL from env or 'http://localhost:4000'
6. Error handling: parse response.json() for error message
7. Return parsed JSON directly

### Error Handling
- Server returns error messages in response body
- Throw Error with message for client-side handling
- Try-catch in components or use error states

## Common Patterns Observed

### Authorization Pattern
- Roles checked at controller/method level
- User context passed through entire request
- Service methods validate permissions early
- Throw ForbiddenException for unauthorized access

### Validation Pattern
- DTOs have class-validator decorators
- Automatic validation by NestJS
- Service-level business validation
- Throw BadRequestException for invalid data

### Data Access Pattern
- All database access through PrismaService
- Include related data in queries
- Select specific fields for API responses
- Combine select and include for nested relations

### Error Pattern
- Use NestJS exceptions: NotFoundException, BadRequestException, ForbiddenException
- HTTP status codes auto-handled by NestJS
- Error messages exposed to client

## Code Style & Conventions

### Naming
- Controllers: PascalCase with Controller suffix
- Services: PascalCase with Service suffix
- DTOs: PascalCase with Dto suffix
- Methods: camelCase
- Files: kebab-case for files

### TypeScript
- Strong typing with interfaces and types
- Export types for client usage
- No implicit any
- Use async/await

### Decorators
- Use NestJS decorators: @Controller, @Get, @Post, @UseGuards
- Use passport decorators: @UseGuards
- Custom decorators: @Roles

### Comments
- JSDoc comments on major methods
- Describe complex logic
- No over-commenting simple code

## Commands to Know

### Development
- `npm run dev` - Run both client and server in watch mode
- `npm run build` - Build both workspaces
- `npm run test` - Test both workspaces

### Server-specific
- `npm run start:dev --workspace=server` - Server watch mode
- `npm run lint --workspace=server` - Lint and fix
- `npm run format --workspace=server` - Format code

### Database
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Generate Prisma client
