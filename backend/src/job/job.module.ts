import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SequelizeModule } from '@nestjs/sequelize';
import { JobProducer } from './job.producer';
import { NotificationConsumer } from './notification.consumer';
import { ActivityConsumer } from './activity.consumer';
import { ActivityLog } from '../database/models';
import { TASK_NOTIFICATION_QUEUE, ACTIVITY_LOG_QUEUE } from './constants';

@Module({
    imports: [
        BullModule.registerQueue(
            { name: TASK_NOTIFICATION_QUEUE },
            { name: ACTIVITY_LOG_QUEUE },
        ),
        SequelizeModule.forFeature([ActivityLog]),
    ],
    providers: [JobProducer, NotificationConsumer, ActivityConsumer],
    exports: [JobProducer],
})
export class JobModule { }
