import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TASK_NOTIFICATION_QUEUE } from './constants';

@Processor(TASK_NOTIFICATION_QUEUE)
export class NotificationConsumer extends WorkerHost {
    private readonly logger = new Logger(NotificationConsumer.name);

    async process(job: Job<{ taskTitle: string }>) {
        const { taskTitle } = job.data;
        this.logger.log(`Task '${taskTitle}' created – Notification sent.`);
    }
}
