import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task, TaskStatus, ActivityAction } from '../database/models';
import { ProjectService } from '../project/project.service';
import { JobProducer } from '../job/job.producer';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from './dto/pagination.dto';

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE],
    [TaskStatus.DONE]: [],
};

@Injectable()
export class TaskService {
    constructor(
        @InjectModel(Task) private readonly taskModel: typeof Task,
        private readonly projectService: ProjectService,
        private readonly jobProducer: JobProducer,
    ) { }

    async create(projectId: string, userId: string, dto: CreateTaskDto): Promise<Task> {
        await this.projectService.findOne(projectId, userId);

        const task = await this.taskModel.create({
            ...dto,
            projectId,
            status: TaskStatus.TODO,
        });

        await this.jobProducer.sendTaskNotification(task.title);
        await this.jobProducer.logActivity({
            action: ActivityAction.TASK_CREATED,
            details: `Task '${task.title}' created`,
            taskId: task.id,
            projectId,
        });

        return task;
    }

    async findAll(projectId: string, userId: string, pagination: PaginationDto) {
        await this.projectService.findOne(projectId, userId);

        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const { count, rows } = await this.taskModel.findAndCountAll({
            where: { projectId },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        const grouped = {
            [TaskStatus.TODO]: rows.filter((t) => t.status === TaskStatus.TODO),
            [TaskStatus.IN_PROGRESS]: rows.filter((t) => t.status === TaskStatus.IN_PROGRESS),
            [TaskStatus.DONE]: rows.filter((t) => t.status === TaskStatus.DONE),
        };

        return {
            tasks: grouped,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    async findOne(id: string, projectId: string, userId: string): Promise<Task> {
        await this.projectService.findOne(projectId, userId);

        const task = await this.taskModel.findOne({
            where: { id, projectId },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return task;
    }

    async update(
        id: string,
        projectId: string,
        userId: string,
        dto: UpdateTaskDto,
    ): Promise<Task> {
        const task = await this.findOne(id, projectId, userId);

        if (dto.status && dto.status !== task.status) {
            const allowedTransitions = VALID_TRANSITIONS[task.status];
            if (!allowedTransitions.includes(dto.status)) {
                throw new BadRequestException(
                    `Cannot transition from ${task.status} to ${dto.status}`,
                );
            }

            await this.jobProducer.logActivity({
                action: ActivityAction.STATUS_CHANGED,
                details: `Task '${task.title}' status changed from ${task.status} to ${dto.status}`,
                taskId: task.id,
                projectId,
            });
        }

        await task.update(dto);
        return task;
    }

    async remove(id: string, projectId: string, userId: string): Promise<void> {
        const task = await this.findOne(id, projectId, userId);

        await this.jobProducer.logActivity({
            action: ActivityAction.TASK_DELETED,
            details: `Task '${task.title}' deleted`,
            taskId: task.id,
            projectId,
        });

        await task.destroy();
    }
}
