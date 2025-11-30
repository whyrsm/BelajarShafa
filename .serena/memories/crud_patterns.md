# CRUD Implementation Patterns

## Complete CRUD Flow Example: Classes Module

### 1. Entity Definition (Prisma Schema)
```prisma
model Class {
  id             String        @id @default(uuid())
  name           String
  description    String?
  code           String        @unique
  organizationId String?
  startDate      DateTime?
  endDate        DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  organization   Organization? @relation(fields: [organizationId], references: [id])
  sessions       Session[]
  mentees        User[]        @relation("ClassMentee")
  mentors        User[]        @relation("ClassMentor")
}
```

### 2. Create DTO
```typescript
export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  mentorIds: string[];

  @IsString()
  @IsOptional()
  organizationId?: string;
}
```

### 3. Service Implementation
Key patterns:
- Check permissions first
- Validate input data
- Handle unique constraints (e.g., class code generation)
- Return with includes for related data

```typescript
async create(createClassDto: CreateClassDto, userId: string, userRole: string) {
  // 1. Permission check
  if (userRole !== 'MANAGER' && userRole !== 'MENTOR') {
    throw new ForbiddenException('Only Managers and Mentors can create classes');
  }

  // 2. Data validation
  const mentors = await this.prisma.user.findMany({
    where: {
      id: { in: mentorIds },
      role: 'MENTOR',
    },
  });
  if (mentors.length !== mentorIds.length) {
    throw new BadRequestException('One or more mentor IDs are invalid');
  }

  // 3. Create with related data
  return this.prisma.class.create({
    data: {
      name: createClassDto.name,
      description: createClassDto.description,
      code: await this.generateUniqueCode(),
      mentors: {
        connect: mentorIds.map(id => ({ id })),
      },
      organizationId: createClassDto.organizationId,
    },
    include: {
      mentors: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      mentees: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
```

### 4. Controller
```typescript
@Post()
@UseGuards(RolesGuard)
@Roles('MANAGER', 'MENTOR')
create(@Body() createClassDto: CreateClassDto, @Request() req) {
  return this.classesService.create(
    createClassDto,
    req.user.userId,
    req.user.role,
  );
}
```

### 5. Module Setup
```typescript
@Module({
  imports: [PrismaModule],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule { }
```

## Read Patterns

### GetAll with Filtering
```typescript
async findAll(userId: string, userRole: string) {
  // Role-based filtering
  if (userRole === 'MENTEE') {
    return this.prisma.class.findMany({
      where: {
        mentees: {
          some: { id: userId },
        },
      },
      include: { mentors: {...}, mentees: {...} },
    });
  }
  
  // Manager/Mentor sees their classes
  return this.prisma.class.findMany({
    where: {
      mentors: {
        some: { id: userId },
      },
    },
    include: { mentors: {...}, mentees: {...} },
  });
}
```

### GetById with Access Control
```typescript
async findOne(id: string, userId: string, userRole: string) {
  const classData = await this.prisma.class.findUnique({
    where: { id },
    include: { mentors: {...}, mentees: {...} },
  });

  if (!classData) {
    throw new NotFoundException('Class not found');
  }

  // Check user has access
  const hasAccess = classData.mentors.some(m => m.id === userId) ||
                    classData.mentees.some(m => m.id === userId) ||
                    userRole === 'ADMIN';
  
  if (!hasAccess) {
    throw new ForbiddenException('You do not have access to this class');
  }

  return classData;
}
```

## Update Patterns

### Update DTO (extends or partial)
```typescript
export class UpdateClassDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
```

### Service Update
```typescript
async update(id: string, updateClassDto: UpdateClassDto, userId: string, userRole: string) {
  // 1. Check resource exists and user has access
  const classData = await this.prisma.class.findUnique({
    where: { id },
    include: { mentors: true },
  });

  if (!classData) {
    throw new NotFoundException('Class not found');
  }

  // 2. Check permissions
  const isMentor = classData.mentors.some(m => m.id === userId);
  if (userRole !== 'MANAGER' && !isMentor) {
    throw new ForbiddenException('You do not have permission to update this class');
  }

  // 3. Update
  return this.prisma.class.update({
    where: { id },
    data: updateClassDto,
    include: { mentors: {...}, mentees: {...} },
  });
}
```

## Delete Patterns

### Service Delete
```typescript
async remove(id: string, userId: string, userRole: string) {
  // 1. Check exists and access
  const classData = await this.prisma.class.findUnique({
    where: { id },
    include: { mentors: true },
  });

  if (!classData) {
    throw new NotFoundException('Class not found');
  }

  // 2. Check permissions (only manager/admin)
  if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
    throw new ForbiddenException('Only Managers and Admins can delete classes');
  }

  // 3. Delete cascading or check constraints
  return this.prisma.class.delete({
    where: { id },
  });
}
```

## Special Patterns (Non-Standard CRUD)

### Membership Management
```typescript
async joinByCode(joinClassDto: JoinClassDto, userId: string, userRole: string) {
  if (userRole !== 'MENTEE') {
    throw new ForbiddenException('Only Mentees can join classes');
  }

  const classData = await this.prisma.class.findUnique({
    where: { code: joinClassDto.code.toUpperCase() },
    include: { mentees: true },
  });

  if (!classData) {
    throw new NotFoundException('Class not found');
  }

  // Check not already member
  if (classData.mentees.some(m => m.id === userId)) {
    throw new BadRequestException('You are already a member of this class');
  }

  // Add mentee
  return this.prisma.class.update({
    where: { id: classData.id },
    data: {
      mentees: {
        connect: { id: userId },
      },
    },
    include: { mentors: {...}, mentees: {...} },
  });
}

async leaveClass(id: string, userId: string, userRole: string) {
  if (userRole !== 'MENTEE') {
    throw new ForbiddenException('Only Mentees can leave classes');
  }

  const classData = await this.prisma.class.findUnique({
    where: { id },
    include: { mentees: true },
  });

  if (!classData) {
    throw new NotFoundException('Class not found');
  }

  // Check is member
  if (!classData.mentees.some(m => m.id === userId)) {
    throw new BadRequestException('You are not a member of this class');
  }

  // Remove mentee
  return this.prisma.class.update({
    where: { id },
    data: {
      mentees: {
        disconnect: { id: userId },
      },
    },
    include: { mentors: {...}, mentees: {...} },
  });
}
```

### Assign/Reassign Relationships
```typescript
async assignMentors(id: string, assignMentorsDto: AssignMentorsDto, userId: string, userRole: string) {
  // Permission check
  if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
    throw new ForbiddenException('Only Managers and Admins can assign mentors');
  }

  // Validate mentors exist
  const mentors = await this.prisma.user.findMany({
    where: {
      id: { in: assignMentorsDto.mentorIds },
      role: 'MENTOR',
    },
  });

  if (mentors.length !== assignMentorsDto.mentorIds.length) {
    throw new BadRequestException('One or more mentor IDs are invalid');
  }

  // Replace mentors (disconnect all, then connect new ones)
  return this.prisma.class.update({
    where: { id },
    data: {
      mentors: {
        set: assignMentorsDto.mentorIds.map(id => ({ id })),
      },
    },
    include: { mentors: {...}, mentees: {...} },
  });
}
```

## Client-Side API Patterns

### Standard API Functions
```typescript
export async function createClass(data: CreateClassData): Promise<Class> {
  const response = await fetchWithAuth('/classes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getClasses(): Promise<Class[]> {
  const response = await fetchWithAuth('/classes');
  return response.json();
}

export async function getClassById(id: string): Promise<Class> {
  const response = await fetchWithAuth(`/classes/${id}`);
  return response.json();
}

export async function updateClass(id: string, data: UpdateClassData): Promise<Class> {
  const response = await fetchWithAuth(`/classes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteClass(id: string): Promise<void> {
  await fetchWithAuth(`/classes/${id}`, {
    method: 'DELETE',
  });
}
```

### Special Operations
```typescript
export async function joinClass(data: JoinClassData): Promise<Class> {
  const response = await fetchWithAuth('/classes/join', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function leaveClass(id: string): Promise<void> {
  await fetchWithAuth(`/classes/${id}/leave`, {
    method: 'DELETE',
  });
}

export async function assignMentors(classId: string, data: AssignMentorsData): Promise<Class> {
  const response = await fetchWithAuth(`/classes/${classId}/mentors`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}
```
