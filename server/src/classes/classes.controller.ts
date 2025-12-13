import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JoinClassDto } from './dto/join-class.dto';
import { AssignMentorsDto } from './dto/assign-mentors.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('MANAGER', 'MENTOR')
    create(@Body() createClassDto: CreateClassDto, @Request() req) {
        // Support both roles array and single role (backward compatibility)
        // Handle empty array case: if roles is empty array, fallback to role
        const userRoles = (req.user.roles && req.user.roles.length > 0) 
            ? req.user.roles 
            : (req.user.role ? [req.user.role] : []);
        return this.classesService.create(
            createClassDto,
            req.user.userId,
            userRoles,
        );
    }

    @Get()
    findAll(@Request() req) {
        // Support both roles array and single role (backward compatibility)
        // Handle empty array case: if roles is empty array, fallback to role
        const userRoles = (req.user.roles && req.user.roles.length > 0) 
            ? req.user.roles 
            : (req.user.role ? [req.user.role] : []);
        return this.classesService.findAll(req.user.userId, userRoles);
    }

    @Post('join')
    @UseGuards(RolesGuard)
    @Roles('MENTEE')
    joinByCode(@Body() joinClassDto: JoinClassDto, @Request() req) {
        return this.classesService.joinByCode(joinClassDto, req.user.userId, req.user.role);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        // Support both roles array and single role (backward compatibility)
        // Handle empty array case: if roles is empty array, fallback to role
        const userRoles = (req.user.roles && req.user.roles.length > 0) 
            ? req.user.roles 
            : (req.user.role ? [req.user.role] : []);
        return this.classesService.findOne(id, req.user.userId, userRoles);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('MANAGER', 'MENTOR')
    update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto, @Request() req) {
        return this.classesService.update(id, updateClassDto, req.user.userId, req.user.role);
    }

    @Delete(':id/leave')
    @UseGuards(RolesGuard)
    @Roles('MENTEE')
    leaveClass(@Param('id') id: string, @Request() req) {
        return this.classesService.leaveClass(id, req.user.userId, req.user.role);
    }

    @Delete(':id/mentees/:menteeId')
    @UseGuards(RolesGuard)
    @Roles('MENTOR', 'MANAGER', 'ADMIN')
    removeMentee(@Param('id') id: string, @Param('menteeId') menteeId: string, @Request() req) {
        return this.classesService.removeMentee(id, menteeId, req.user.userId, req.user.role);
    }

    @Post(':id/mentors')
    @UseGuards(RolesGuard)
    @Roles('MANAGER', 'ADMIN')
    assignMentors(@Param('id') id: string, @Body() assignMentorsDto: AssignMentorsDto, @Request() req) {
        return this.classesService.assignMentors(id, assignMentorsDto, req.user.userId, req.user.role);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('MANAGER', 'ADMIN')
    remove(@Param('id') id: string, @Request() req) {
        return this.classesService.remove(id, req.user.userId, req.user.role);
    }
}

