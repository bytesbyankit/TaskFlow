import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TASK_NOTIFICATION_QUEUE, ACTIVITY_LOG_QUEUE } from './constants';
import { ActivityAction } from '../database/models';

@Injectable()
export class JobProducer {
    constructor(
        @InjectQueue(TASK_NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
        @InjectQueue(ACTIVITY_LOG_QUEUE) private readonly activityQueue: Queue,
    ) { }

    async sendTaskNotification(taskTitle: string) {
        await this.notificationQueue.add('task-created', { taskTitle });
    }

    async logActivity(data: {
        action: ActivityAction;
        details: string;
        taskId: string | null;
        projectId: string;
    }) {
        await this.activityQueue.add('log-activity', data);
    }
}
