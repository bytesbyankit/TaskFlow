import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../database/models';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post()
    create(
        @Param('projectId') projectId: string,
        @CurrentUser() user: User,
        @Body() dto: CreateTaskDto,
    ) {
        return this.taskService.create(projectId, user.id, dto);
    }

    @Get()
    findAll(
        @Param('projectId') projectId: string,
        @CurrentUser() user: User,
        @Query() pagination: PaginationDto,
    ) {
        return this.taskService.findAll(projectId, user.id, pagination);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
        @Param('projectId') projectId: string,
        @CurrentUser() user: User,
    ) {
        return this.taskService.findOne(id, projectId, user.id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Param('projectId') projectId: string,
        @CurrentUser() user: User,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.taskService.update(id, projectId, user.id, dto);
    }

    @Delete(':id')
    remove(
        @Param('id') id: string,
        @Param('projectId') projectId: string,
        @CurrentUser() user: User,
    ) {
        return this.taskService.remove(id, projectId, user.id);
    }
}
