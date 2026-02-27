import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project, Task, ActivityLog } from '../database/models';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
    constructor(
        @InjectModel(Project) private readonly projectModel: typeof Project,
    ) { }

    async create(userId: string, dto: CreateProjectDto): Promise<Project> {
        return this.projectModel.create({ ...dto, userId });
    }

    async findAll(userId: string): Promise<Project[]> {
        return this.projectModel.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [{ model: Task, attributes: ['id', 'status'] }],
        });
    }

    async findOne(id: string, userId: string): Promise<Project> {
        const project = await this.projectModel.findOne({
            where: { id, userId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    async remove(id: string, userId: string): Promise<void> {
        const project = await this.findOne(id, userId);

        await ActivityLog.destroy({ where: { projectId: project.id } });
        await Task.destroy({ where: { projectId: project.id } });
        await project.destroy();
    }
}
