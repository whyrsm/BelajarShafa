"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesController = void 0;
const common_1 = require("@nestjs/common");
const classes_service_1 = require("./classes.service");
const create_class_dto_1 = require("./dto/create-class.dto");
const update_class_dto_1 = require("./dto/update-class.dto");
const join_class_dto_1 = require("./dto/join-class.dto");
const assign_mentors_dto_1 = require("./dto/assign-mentors.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_guard_2 = require("../auth/roles.guard");
let ClassesController = class ClassesController {
    constructor(classesService) {
        this.classesService = classesService;
    }
    create(createClassDto, req) {
        return this.classesService.create(createClassDto, req.user.userId, req.user.role);
    }
    findAll(req) {
        return this.classesService.findAll(req.user.userId, req.user.role);
    }
    findOne(id, req) {
        return this.classesService.findOne(id, req.user.userId, req.user.role);
    }
    update(id, updateClassDto, req) {
        return this.classesService.update(id, updateClassDto, req.user.userId, req.user.role);
    }
    remove(id, req) {
        return this.classesService.remove(id, req.user.userId, req.user.role);
    }
    joinByCode(joinClassDto, req) {
        return this.classesService.joinByCode(joinClassDto, req.user.userId, req.user.role);
    }
    leaveClass(id, req) {
        return this.classesService.leaveClass(id, req.user.userId, req.user.role);
    }
    assignMentors(id, assignMentorsDto, req) {
        return this.classesService.assignMentors(id, assignMentorsDto, req.user.userId, req.user.role);
    }
    removeMentee(id, menteeId, req) {
        return this.classesService.removeMentee(id, menteeId, req.user.userId, req.user.role);
    }
};
exports.ClassesController = ClassesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('MANAGER', 'MENTOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_class_dto_1.CreateClassDto, Object]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('MANAGER', 'MENTOR'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_dto_1.UpdateClassDto, Object]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('MANAGER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('MENTEE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_class_dto_1.JoinClassDto, Object]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "joinByCode", null);
__decorate([
    (0, common_1.Delete)(':id/leave'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('MENTEE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "leaveClass", null);
__decorate([
    (0, common_1.Post)(':id/mentors'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('MANAGER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_mentors_dto_1.AssignMentorsDto, Object]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "assignMentors", null);
__decorate([
    (0, common_1.Delete)(':id/mentees/:menteeId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('MENTOR', 'MANAGER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('menteeId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ClassesController.prototype, "removeMentee", null);
exports.ClassesController = ClassesController = __decorate([
    (0, common_1.Controller)('classes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [classes_service_1.ClassesService])
], ClassesController);
//# sourceMappingURL=classes.controller.js.map