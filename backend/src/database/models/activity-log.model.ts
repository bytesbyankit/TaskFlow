import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    Default,
} from 'sequelize-typescript';
import { Project } from './project.model';

export enum ActivityAction {
    TASK_CREATED = 'TASK_CREATED',
    STATUS_CHANGED = 'STATUS_CHANGED',
    TASK_DELETED = 'TASK_DELETED',
}

@Table({ tableName: 'activity_logs', timestamps: true, updatedAt: false })
export class ActivityLog extends Model {
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID, primaryKey: true })
    declare id: string;

    @Column({ type: DataType.ENUM(...Object.values(ActivityAction)), allowNull: false })
    declare action: ActivityAction;

    @Column({ type: DataType.TEXT, allowNull: false })
    declare details: string;

    @Column({ type: DataType.UUID, allowNull: true })
    declare taskId: string;

    @ForeignKey(() => Project)
    @Column({ type: DataType.UUID, allowNull: false })
    declare projectId: string;

    @BelongsTo(() => Project)
    declare project: Project;
}
