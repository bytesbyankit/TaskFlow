import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { PaginatedTasks, Task, TaskStatus } from '@/lib/types';

interface TaskState {
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
    loading: boolean;
    error: string | null;
}

const initialState: TaskState = {
    tasks: {
        [TaskStatus.TODO]: [],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.DONE]: [],
    },
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    loading: false,
    error: null,
};

export const fetchTasks = createAsyncThunk(
    'task/fetchAll',
    async ({ projectId, page = 1, limit = 10 }: { projectId: string; page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const { data } = await api.get<PaginatedTasks>(`/projects/${projectId}/tasks`, {
                params: { page, limit },
            });
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
        }
    },
);

export const createTask = createAsyncThunk(
    'task/create',
    async ({ projectId, body }: { projectId: string; body: { title: string; description?: string } }, { rejectWithValue }) => {
        try {
            const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, body);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create task');
        }
    },
);

export const updateTask = createAsyncThunk(
    'task/update',
    async (
        { projectId, taskId, body }: { projectId: string; taskId: string; body: { title?: string; description?: string; status?: TaskStatus } },
        { rejectWithValue },
    ) => {
        try {
            const { data } = await api.patch<Task>(`/projects/${projectId}/tasks/${taskId}`, body);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update task');
        }
    },
);

export const deleteTask = createAsyncThunk(
    'task/delete',
    async ({ projectId, taskId }: { projectId: string; taskId: string }, { rejectWithValue }) => {
        try {
            await api.delete(`/projects/${projectId}/tasks/${taskId}`);
            return taskId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
        }
    },
);

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        resetTasks: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<PaginatedTasks>) => {
                state.loading = false;
                state.tasks = action.payload.tasks;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
                state.tasks[TaskStatus.TODO].unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
                const updatedTask = action.payload;
                for (const status of Object.values(TaskStatus)) {
                    state.tasks[status] = state.tasks[status].filter((t) => t.id !== updatedTask.id);
                }
                state.tasks[updatedTask.status].unshift(updatedTask);
            })
            .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
                for (const status of Object.values(TaskStatus)) {
                    state.tasks[status] = state.tasks[status].filter((t) => t.id !== action.payload);
                }
                state.pagination.total -= 1;
            });
    },
});

export const { resetTasks } = taskSlice.actions;
export default taskSlice.reducer;
