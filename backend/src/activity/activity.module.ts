import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActivityController } from './activity.controller';
import { ActivityLog } from '../database/models';
import { ProjectModule } from '../project/project.module';

@Module({
    imports: [
        SequelizeModule.forFeature([ActivityLog]),
        ProjectModule,
    ],
    controllers: [ActivityController],
})
export class ActivityModule { }
