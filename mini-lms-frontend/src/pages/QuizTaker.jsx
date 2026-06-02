import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QuizTaker = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null); // seconds
    const [loading, setLoading] = useState(true);

    const handleSubmit = useCallback(async (isAuto = false) => {
        if (submitted) return;

        const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
            questionId: parseInt(qId),
            selectedOptionId: oId
        }));

        try {
            const res = await apiPost('/quizzes/submit', { quizId: id, answers: formattedAnswers });
            setScore(res.score);
            setSubmitted(true);
            if (isAuto) addToast('Time expired! Quiz submitted automatically.', 'warning');
        } catch (err) {
            addToast(err.message || 'Submission failed', 'error');
            if (err.message?.includes('Maximum attempts')) {
                navigate(-1);
            }
        }
    }, [id, answers, submitted, addToast, navigate]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGet(`/quizzes/${id}/questions`);
                setQuiz(data.quiz);
                setQuestions(data.questions || []);
                if (data.quiz?.Duration) {
                    setTimeLeft(data.quiz.Duration * 60);
                }
            } catch (err) {
                addToast(err.message || 'Failed to load quiz', 'error');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, addToast, navigate]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null || submitted) return;

        if (timeLeft <= 0) {
            handleSubmit(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted, handleSubmit]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl"
            >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={48} />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Submission Successful</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Your performance has been recorded</p>
                </div>
                <div className="p-8 px-12 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Final Score</p>
                    <p className="text-6xl font-black text-blue-600 italic tracking-tighter">{score}<span className="text-2xl text-slate-300 not-italic ml-2">pts</span></p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="group flex items-center gap-3 p-5 px-10 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                    Return to Terminal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-10">
            {/* Quiz Header with Timer */}
            <div className="sticky top-20 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">
                        {quiz?.Title || 'Quiz Session'}
                    </h1>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questions: {questions.length}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Max Score: {quiz?.Max_Score}</span>
                    </div>
                </div>

                {timeLeft !== null && (
                    <div className={`flex items-center gap-4 p-4 px-6 rounded-2xl border-2 transition-colors ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white'}`}>
                        <Clock size={20} className={timeLeft < 60 ? 'animate-spin-slow' : ''} />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Time Remaining</span>
                            <span className="text-2xl font-black italic tracking-tighter leading-none">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                    className="h-full bg-blue-600"
                />
            </div>

            <div className="space-y-8">
                {questions.map((q, idx) => (
                    <motion.div
                        key={q.QuestionID}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-10 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border transition-all duration-500 ${
                            answers[q.QuestionID]
                                ? 'border-blue-500/20 bg-blue-50/10 dark:bg-blue-500/5'
                                : 'border-slate-200 dark:border-white/5'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <span className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs italic">
                                    {idx + 1}
                                </span>
                                <p className="text-xl font-black text-slate-800 dark:text-white italic tracking-tight">
                                    {q.QuestionText}
                                </p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                                {q.Points} pts
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options?.map(opt => (
                                <button
                                    key={opt.OptionID}
                                    onClick={() => setAnswers({...answers, [q.QuestionID]: opt.OptionID})}
                                    className={`w-full text-left p-5 px-6 rounded-2xl border-2 transition-all group ${
                                        answers[q.QuestionID] === opt.OptionID
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20'
                                            : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm">{opt.OptionText}</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            answers[q.QuestionID] === opt.OptionID ? 'border-white bg-white/20' : 'border-slate-200 dark:border-white/10 group-hover:border-blue-400'
                                        }`}>
                                            {answers[q.QuestionID] === opt.OptionID && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-10 bg-blue-600/5 rounded-[3rem] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-2xl flex items-center justify-center">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white italic">Confirm Finalization</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Once submitted, this attempt cannot be retracted.</p>
                    </div>
                </div>

                <button
                    onClick={() => handleSubmit(false)}
                    disabled={Object.keys(answers).length < questions.length}
                    className="w-full md:w-auto p-6 px-12 bg-slate-900 dark:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:grayscale"
                >
                    Authorize Submission
                </button>
            </div>
        </div>
    );
};

export default QuizTaker;
