import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Book, Users, Star, ArrowRight, CheckCircle2,
    Filter, LayoutGrid, List, Sparkles, GraduationCap, MapPin
} from 'lucide-react';
import { apiGet, apiPost } from '../services/api';
import { useToast } from '../context/ToastContext';

const CourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const { addToast } = useToast();

    useEffect(() => {
        loadCatalog();
    }, []);

    const loadCatalog = async () => {
        try {
            const data = await apiGet('/student/catalog');
            setCourses(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId, courseName) => {
        try {
            await apiPost('/student/enroll', { courseId });
            addToast(`Successfully enrolled in ${courseName}!`, 'success');
            loadCatalog(); // Refresh to update status
        } catch (err) {
            addToast(err.message || 'Enrollment failed', 'error');
        }
    };

    const filteredCourses = courses.filter(c =>
        c.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.InstructorName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Hero Section */}
            <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden shadow-2xl shadow-blue-500/20">
                <div className="relative z-10 space-y-6 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={12} className="text-yellow-400" /> Discover Your Future
                    </div>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Course <span className="text-blue-200">Catalog</span>
                    </h1>
                    <p className="text-blue-50 text-lg font-medium leading-relaxed">
                        Explore our world-class curriculum and embark on your next academic adventure.
                        Self-enrollment is now open for the Spring 2026 semester.
                    </p>

                    {/* Search Bar */}
                    <div className="relative group max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search courses or instructors..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-inner"
                        />
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-20">
                    <GraduationCap size={400} className="absolute -top-20 -right-20 text-white rotate-12" />
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                        {filteredCourses.length} Courses Available
                    </h2>
                </div>
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-400'}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-400'}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Catalog Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
                <AnimatePresence mode="popLayout">
                    {filteredCourses.map((course, idx) => (
                        <motion.div
                            key={course.CourseID}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`group bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 ${viewMode === 'list' ? 'flex items-center' : ''}`}
                        >
                            {/* Course Image */}
                            <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-48' : 'aspect-video'}`}>
                                <img
                                    src={course.Picture ? course.Picture : `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60`}
                                    alt={course.Name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                {course.IsEnrolled && (
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                        <CheckCircle2 size={12} /> Enrolled
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-8 flex-1 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {course.Name}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 font-medium">
                                        {course.Description || 'No description available for this course yet.'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 overflow-hidden shadow-sm">
                                            {course.InstructorAvatar ? (
                                                <img src={course.InstructorAvatar} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <GraduationCap size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{course.InstructorName || 'Staff'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Students</p>
                                        <p className="text-sm font-bold text-blue-600">{course.StudentCount}</p>
                                    </div>
                                </div>

                                <button
                                    disabled={course.IsEnrolled}
                                    onClick={() => handleEnroll(course.CourseID, course.Name)}
                                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                                        course.IsEnrolled
                                            ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                                            : 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95'
                                    }`}
                                >
                                    {course.IsEnrolled ? 'Already Enrolled' : (
                                        <>
                                            Enroll Now <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-20 space-y-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Search size={32} />
                    </div>
                    <p className="text-slate-500 font-bold italic tracking-tighter uppercase">No courses found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default CourseCatalog;
