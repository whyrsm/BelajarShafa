import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  findAll(@Query() filterDto: UserFilterDto, @Req() req: any) {
    // Only managers get scoped results, admins see all
    const managerId = req.user.roles?.includes('ADMIN') ? undefined : req.user.userId;
    return this.usersService.findAllFiltered(filterDto, managerId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  getStats(@Req() req: any) {
    const managerId = req.user.roles?.includes('ADMIN') ? undefined : req.user.userId;
    return this.usersService.getUserStats(managerId);
  }

  @Get('filtered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  findAllFiltered(@Query() filterDto: UserFilterDto, @Req() req: any) {
    const managerId = req.user.roles?.includes('ADMIN') ? undefined : req.user.userId;
    return this.usersService.findAllFiltered(filterDto, managerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mentors')
  findMentors() {
    return this.usersService.findMentors();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  getUserDetails(@Param('id') id: string) {
    return this.usersService.getUserDetails(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    // Prevent managers from editing their own roles
    if (id === req.user.userId && updateUserDto.roles) {
      throw new ForbiddenException('You cannot modify your own roles');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  updateRoles(@Param('id') id: string, @Body() updateRolesDto: UpdateRolesDto, @Req() req: any) {
    // Prevent managers from editing their own roles
    if (id === req.user.userId) {
      throw new ForbiddenException('You cannot modify your own roles');
    }
    return this.usersService.updateRoles(id, updateRolesDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  toggleActive(@Param('id') id: string, @Req() req: any) {
    // Prevent managers from deactivating themselves
    if (id === req.user.userId) {
      throw new ForbiddenException('You cannot deactivate yourself');
    }
    return this.usersService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
