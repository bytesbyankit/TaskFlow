import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from './models/user.model';
import { Project } from './models/project.model';
import { Task } from './models/task.model';
import { ActivityLog } from './models/activity-log.model';

dotenv.config();

async function seed() {
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        models: [User, Project, Task, ActivityLog],
        logging: false,
    });

    await sequelize.sync();

    const hashedPassword = await bcrypt.hash('password123', 10);

    const [user] = await User.findOrCreate({
        where: { email: 'admin@taskmanager.local' },
        defaults: {
            name: 'Admin',
            email: 'admin@taskmanager.local',
            password: hashedPassword,
        },
    });

    console.log(`Seeded user: ${user.email}`);
    await sequelize.close();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
