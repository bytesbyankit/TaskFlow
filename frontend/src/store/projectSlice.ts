import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { Project } from '@/lib/types';

interface ProjectState {
    projects: Project[];
    loading: boolean;
    error: string | null;
}

const initialState: ProjectState = {
    projects: [],
    loading: false,
    error: null,
};

export const fetchProjects = createAsyncThunk('project/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Project[]>('/projects');
        return data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
    }
});

export const createProject = createAsyncThunk(
    'project/create',
    async (body: { name: string; description?: string }, { rejectWithValue }) => {
        try {
            const { data } = await api.post<Project>('/projects', body);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create project');
        }
    },
);

export const deleteProject = createAsyncThunk(
    'project/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/projects/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete project');
        }
    },
);

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.projects.unshift(action.payload);
            })
            .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
                state.projects = state.projects.filter((p) => p.id !== action.payload);
            });
    },
});

export default projectSlice.reducer;
