'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTasks, createTask, updateTask, deleteTask, resetTasks } from '@/store/taskSlice';
import AuthGuard from '@/components/AuthGuard';
import { TaskStatus, Task } from '@/lib/types';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { ActivityLog } from '@/lib/types';

const STATUS_CONFIG = {
    [TaskStatus.TODO]: { label: 'Todo', color: 'from-slate-500 to-slate-600', badge: 'bg-slate-500/20 text-slate-300', dot: 'bg-slate-400' },
    [TaskStatus.IN_PROGRESS]: { label: 'In Progress', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300', dot: 'bg-amber-400' },
    [TaskStatus.DONE]: { label: 'Done', color: 'from-emerald-500 to-green-600', badge: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-400' },
};

const NEXT_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
    [TaskStatus.TODO]: TaskStatus.IN_PROGRESS,
    [TaskStatus.IN_PROGRESS]: TaskStatus.DONE,
};

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const dispatch = useAppDispatch();
    const { tasks, pagination, loading } = useAppSelector((state) => state.task);

    const [projectName, setProjectName] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [activities, setActivities] = useState<ActivityLog[]>([]);

    useEffect(() => {
        dispatch(fetchTasks({ projectId, page: 1, limit: 50 }));
        api.get(`/projects/${projectId}`).then(({ data }) => setProjectName(data.name)).catch(() => router.push('/dashboard'));
        return () => { dispatch(resetTasks()); };
    }, [dispatch, projectId, router]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        await dispatch(createTask({ projectId, body: { title: title.trim(), description: description.trim() || undefined } }));
        setTitle('');
        setDescription('');
        setShowCreateModal(false);
        toast.success('Task created');
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask || !title.trim()) return;
        await dispatch(updateTask({ projectId, taskId: editingTask.id, body: { title: title.trim(), description: description.trim() } }));
        setEditingTask(null);
        setShowEditModal(false);
        toast.success('Task updated');
    };

    const handleStatusChange = async (task: Task) => {
        const nextStatus = NEXT_STATUS[task.status];
        if (!nextStatus) return;
        await dispatch(updateTask({ projectId, taskId: task.id, body: { status: nextStatus } }));
        toast.success(`Moved to ${STATUS_CONFIG[nextStatus].label}`);
    };

    const handleDelete = async (task: Task) => {
        if (!confirm(`Delete task "${task.title}"?`)) return;
        await dispatch(deleteTask({ projectId, taskId: task.id }));
        toast.success('Task deleted');
    };

    const openEdit = (task: Task) => {
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description || '');
        setShowEditModal(true);
    };

    const openActivities = async () => {
        try {
            const { data } = await api.get(`/projects/${projectId}/activities`);
            setActivities(data);
            setShowActivityModal(true);
        } catch {
            toast.error('Failed to load activities');
        }
    };

    const handlePageChange = (page: number) => {
        dispatch(fetchTasks({ projectId, page, limit: 50 }));
    };

    return (
        <AuthGuard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{projectName || 'Loading…'}</h1>
                            <p className="text-slate-400 mt-1">{pagination.total} task{pagination.total !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openActivities}
                            className="px-4 py-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all font-medium text-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Activity
                        </button>
                        <button
                            onClick={() => { setTitle(''); setDescription(''); setShowCreateModal(true); }}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Task
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
                                <div className="h-5 bg-slate-700 rounded w-1/2 mb-4" />
                                <div className="space-y-3">
                                    <div className="h-20 bg-slate-700/50 rounded-xl" />
                                    <div className="h-20 bg-slate-700/50 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.values(TaskStatus).map((status) => (
                            <div key={status} className="glass rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
                                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                        {STATUS_CONFIG[status].label}
                                    </h2>
                                    <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                        {tasks[status].length}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {tasks[status].length === 0 ? (
                                        <p className="text-sm text-slate-600 text-center py-8">No tasks</p>
                                    ) : (
                                        tasks[status].map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all group"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-sm font-medium text-white flex-1">{task.title}</h3>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEdit(task)}
                                                            className="p-1 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-all"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(task)}
                                                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                {task.description && (
                                                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{task.description}</p>
                                                )}
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(task.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {NEXT_STATUS[task.status] && (
                                                        <button
                                                            onClick={() => handleStatusChange(task)}
                                                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${STATUS_CONFIG[NEXT_STATUS[task.status]!].badge} hover:opacity-80`}
                                                        >
                                                            → {STATUS_CONFIG[NEXT_STATUS[task.status]!].label}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-3 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`px-3 py-2 text-sm rounded-lg transition-all ${p === pagination.page
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-3 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}

                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
                        <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">Add Task</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label htmlFor="task-title" className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                                    <input
                                        id="task-title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        placeholder="e.g. Design API"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="task-desc" className="block text-sm font-medium text-slate-300 mb-1.5">Description (optional)</label>
                                    <textarea
                                        id="task-desc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Describe the task…"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all font-medium">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25">
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showEditModal && editingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
                        <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">Edit Task</h2>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div>
                                    <label htmlFor="edit-title" className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                                    <input
                                        id="edit-title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-desc" className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                                    <textarea
                                        id="edit-desc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all font-medium">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showActivityModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
                        <div className="glass rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Activity Log</h2>
                                <button onClick={() => setShowActivityModal(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {activities.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-8">No activity yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                                            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${activity.action === 'TASK_CREATED' ? 'bg-emerald-400' :
                                                    activity.action === 'STATUS_CHANGED' ? 'bg-amber-400' : 'bg-red-400'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-300">{activity.details}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
