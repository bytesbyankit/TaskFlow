import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'bullmq';
import { ACTIVITY_LOG_QUEUE } from './constants';
import { ActivityLog, ActivityAction } from '../database/models';

interface ActivityJobData {
    action: ActivityAction;
    details: string;
    taskId: string | null;
    projectId: string;
}

@Processor(ACTIVITY_LOG_QUEUE)
export class ActivityConsumer extends WorkerHost {
    private readonly logger = new Logger(ActivityConsumer.name);

    constructor(
        @InjectModel(ActivityLog) private readonly activityLogModel: typeof ActivityLog,
    ) {
        super();
    }

    async process(job: Job<ActivityJobData>) {
        const { action, details, taskId, projectId } = job.data;

        await this.activityLogModel.create({
            action,
            details,
            taskId,
            projectId,
        });

        this.logger.log(`Activity logged: ${action} – ${details}`);
    }
}
