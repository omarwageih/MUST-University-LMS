import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, PieChart, Users,
    ArrowLeft, Download, RefreshCcw, Activity,
    Calendar, Target, Award
} from 'lucide-react';
import { apiGet } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const CourseAnalytics = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [courseId]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const res = await apiGet(`/instructor/courses/${courseId}/analytics`);
            setData(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return <div className="text-center py-20 uppercase font-black italic text-slate-400">Failed to load analytics engine.</div>;

    const { gradeDistribution, attendanceTrend, assignmentPerformance } = data;

    // Helper for Grade Colors
    const getGradeColor = (bracket) => {
        const colors = {
            'Excellent': 'bg-emerald-500',
            'Very Good': 'bg-blue-500',
            'Good': 'bg-cyan-500',
            'Pass': 'bg-amber-500',
            'Fail': 'bg-red-500'
        };
        return colors[bracket] || 'bg-slate-400';
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
                    >
                        <ArrowLeft size={14} /> Back to Course
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        Course <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Intelligence</span>
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadAnalytics}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCcw size={18} className="text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Grade Distribution (Donut style) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl">
                            <PieChart size={20} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Grade Distribution</h2>
                    </div>

                    <div className="space-y-6">
                        {gradeDistribution.map((item) => (
                            <div key={item.GradeBracket} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                                    <span className="text-slate-500">{item.GradeBracket}</span>
                                    <span className="text-slate-900 dark:text-white">{item.Count} Students</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.Count / gradeDistribution.reduce((a,b) => a + b.Count, 0)) * 100}%` }}
                                        className={`h-full ${getGradeColor(item.GradeBracket)}`}
                                    />
                                </div>
                            </div>
                        ))}
                        {gradeDistribution.length === 0 && (
                            <p className="text-center py-10 text-xs text-slate-400 italic">No grades recorded yet.</p>
                        )}
                    </div>
                </motion.div>

                {/* 2. Attendance Trend (engagement) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl overflow-hidden"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl">
                            <Activity size={20} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Lecture Engagement</h2>
                    </div>

                    <div className="h-64 flex items-end gap-2">
                        {attendanceTrend.map((lec, i) => {
                            const pct = (lec.PresentCount / (lec.TotalEnrolled || 1)) * 100;
                            return (
                                <div key={lec.LectureID} className="flex-1 flex flex-col items-center gap-2 group relative">
                                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                                        <div className="bg-slate-900 text-white text-[10px] p-2 rounded-lg whitespace-nowrap shadow-xl">
                                            {lec.Title}<br/>
                                            {Math.round(pct)}% Present
                                        </div>
                                    </div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${pct}%` }}
                                        className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg min-h-[4px]"
                                    />
                                    <div className="h-8 flex items-center">
                                        <span className="text-[8px] font-black uppercase text-slate-400 rotate-45 origin-left">{i + 1}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 3. Assignment Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-3 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-xl">
                            <Target size={20} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Assignment Proficiency</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {assignmentPerformance.map((item) => (
                            <div key={item.AssignmentID} className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-4 hover:border-blue-500/30 transition-all">
                                <h4 className="text-xs font-black uppercase tracking-tighter text-slate-900 dark:text-white truncate">{item.Title}</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Score</span>
                                        <span className="text-xl font-black text-blue-600 italic">{Math.round(item.AvgScore)}<span className="text-[10px] text-slate-400 not-italic ml-1">/{item.Max_Score}</span></span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Turn-in</span>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.SubmissionCount}/{item.TotalExpected}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default CourseAnalytics;
