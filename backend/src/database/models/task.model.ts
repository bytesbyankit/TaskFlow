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

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

@Table({ tableName: 'tasks', timestamps: true })
export class Task extends Model {
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID, primaryKey: true })
    declare id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare title: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare description: string;

    @Default(TaskStatus.TODO)
    @Column({ type: DataType.ENUM(...Object.values(TaskStatus)), allowNull: false })
    declare status: TaskStatus;

    @ForeignKey(() => Project)
    @Column({ type: DataType.UUID, allowNull: false })
    declare projectId: string;

    @BelongsTo(() => Project)
    declare project: Project;
}
