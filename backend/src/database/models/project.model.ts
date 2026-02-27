import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    HasMany,
    Default,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Task } from './task.model';
import { ActivityLog } from './activity-log.model';

@Table({ tableName: 'projects', timestamps: true })
export class Project extends Model {
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID, primaryKey: true })
    declare id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare description: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    declare userId: string;

    @BelongsTo(() => User)
    declare user: User;

    @HasMany(() => Task)
    declare tasks: Task[];

    @HasMany(() => ActivityLog)
    declare activityLogs: ActivityLog[];
}
