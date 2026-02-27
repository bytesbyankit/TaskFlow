import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User, ActivityLog } from '../database/models';
import { ProjectService } from '../project/project.service';

@Controller('projects/:projectId/activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
    constructor(
        @InjectModel(ActivityLog) private readonly activityLogModel: typeof ActivityLog,
        private readonly projectService: ProjectService,
    ) { }

    @Get()
    async findAll(
        @Param('projectId') projectId: string,
        @CurrentUser() user: User,
    ) {
        await this.projectService.findOne(projectId, user.id);

        return this.activityLogModel.findAll({
            where: { projectId },
            order: [['createdAt', 'DESC']],
            limit: 50,
        });
    }
}
