'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjects, createProject, deleteProject } from '@/store/projectSlice';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const { projects, loading } = useAppSelector((state) => state.project);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await dispatch(createProject({ name: name.trim(), description: description.trim() || undefined }));
        setName('');
        setDescription('');
        setShowModal(false);
        toast.success('Project created');
    };

    const handleDelete = async (id: string, projectName: string) => {
        if (!confirm(`Delete project "${projectName}"? All tasks inside will also be deleted.`)) return;
        await dispatch(deleteProject(id));
        toast.success('Project deleted');
    };

    const getTaskCount = (project: any) => {
        return project.tasks?.length || 0;
    };

    return (
        <AuthGuard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Projects</h1>
                        <p className="text-slate-400 mt-1">Manage your projects and tasks</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                    </button>
                </div>

                {loading && projects.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                                <div className="h-6 bg-slate-700 rounded w-3/4 mb-3" />
                                <div className="h-4 bg-slate-700 rounded w-full mb-2" />
                                <div className="h-4 bg-slate-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center">
                            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">No projects yet</h3>
                        <p className="text-slate-500 mb-6">Create your first project to get started</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
                        >
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="glass rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Link href={`/projects/${project.id}`} className="flex-1">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                            {project.name}
                                        </h3>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(project.id, project.name)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                {project.description && (
                                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        {getTaskCount(project)} task{getTaskCount(project) !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <Link
                                    href={`/projects/${project.id}`}
                                    className="mt-4 inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    View tasks
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
                        <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">Create Project</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label htmlFor="project-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Project Name
                                    </label>
                                    <input
                                        id="project-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="My awesome project"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="project-desc" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        id="project-desc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="What is this project about?"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
