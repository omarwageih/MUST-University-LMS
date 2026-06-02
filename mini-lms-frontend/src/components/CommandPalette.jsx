import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Book, FileText, User, ArrowRight, Loader2, Command } from 'lucide-react';
import { apiGet } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ courses: [], materials: [], users: [] });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults({ courses: [], materials: [], users: [] });
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await apiGet(`/search?q=${query}`);
                setResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (type, id, extra = {}) => {
        setIsOpen(false);
        setQuery('');
        if (type === 'course') navigate(`/course/${id}`);
        if (type === 'user') navigate(`/profile/${id}`);
        if (type === 'material') navigate(`/course/${extra.CourseID || ''}`); // Simple fallback
    };

    const hasResults = results.courses.length > 0 || results.materials.length > 0 || results.users.length > 0;

    return (
        <>
            {/* Command Palette Trigger in Sidebar or Header if needed, but Ctrl+K is the main way */}

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-4">
                                <Search className="text-slate-400" size={20} />
                                <input
                                    autoFocus
                                    placeholder="Search courses, resources, or people..."
                                    className="flex-1 bg-transparent border-none text-lg font-bold italic tracking-tight focus:ring-0 outline-none dark:text-white"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <div className="flex items-center gap-2">
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin text-blue-600" />
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 dark:border-white/10">
                                            ESC
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                                {!query && (
                                    <div className="py-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                                            <Command size={32} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Search Terminal Ready</p>
                                            <p className="text-xs text-slate-500 italic">Try searching for "Database" or "Dr. Abdelhamid"</p>
                                        </div>
                                    </div>
                                )}

                                {query && !loading && !hasResults && (
                                    <div className="py-12 text-center">
                                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">No matches found</p>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {results.courses.length > 0 && (
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2">Courses</h3>
                                            {results.courses.map(c => (
                                                <button
                                                    key={c.CourseID}
                                                    onClick={() => handleSelect('course', c.CourseID)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
                                                >
                                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                                        <Book size={18} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{c.Name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Academic Module</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {results.users.length > 0 && (
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2">People</h3>
                                            {results.users.map(u => (
                                                <button
                                                    key={u.UserID}
                                                    onClick={() => handleSelect('user', u.UserID)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                        {u.ProfilePicture ? (
                                                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${u.ProfilePicture}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                <User size={18} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{u.FullName}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{u.UserType}</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {results.materials.length > 0 && (
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2">Resources</h3>
                                            {results.materials.map(m => (
                                                <button
                                                    key={m.Material_ID}
                                                    onClick={() => handleSelect('material', m.Material_ID, { CourseID: m.CourseID })}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
                                                >
                                                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{m.Title}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{m.Type}</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-[9px] font-black">ENTER</kbd>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-[9px] font-black">↑↓</kbd>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Navigate</span>
                                    </div>
                                </div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">ESC</kbd> to close
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CommandPalette;
