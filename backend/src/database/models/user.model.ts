import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    Default,
    Unique,
} from 'sequelize-typescript';
import { Project } from './project.model';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID, primaryKey: true })
    declare id: string;

    @Unique
    @Column({ type: DataType.STRING, allowNull: false })
    declare email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare password: string;

    @HasMany(() => Project)
    declare projects: Project[];
}
