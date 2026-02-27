export interface User {
    id: string;
    email: string;
    name: string;
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    tasks?: Task[];
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedTasks {
    tasks: {
        [TaskStatus.TODO]: Task[];
        [TaskStatus.IN_PROGRESS]: Task[];
        [TaskStatus.DONE]: Task[];
    };
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ActivityLog {
    id: string;
    action: string;
    details: string;
    taskId: string | null;
    projectId: string;
    createdAt: string;
}
