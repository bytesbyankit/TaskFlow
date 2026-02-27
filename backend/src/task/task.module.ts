import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Task } from '../database/models';
import { ProjectModule } from '../project/project.module';
import { JobModule } from '../job/job.module';

@Module({
    imports: [
        SequelizeModule.forFeature([Task]),
        ProjectModule,
        JobModule,
    ],
    controllers: [TaskController],
    providers: [TaskService],
})
export class TaskModule { }
