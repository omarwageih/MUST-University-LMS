import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../services/api';
import { motion } from 'framer-motion';

const QuizTaker = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGet(`/quizzes/${id}/questions`);
                setQuestions(data || []);
            } catch (err) { console.error(err); }
        };
        load();
    }, [id]);

    const handleSubmit = async () => {
        const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
            questionId: parseInt(qId),
            selectedOptionId: oId
        }));

        try {
            const res = await apiPost('/quizzes/submit', { quizId: id, answers: formattedAnswers });
            setScore(res.score);
            setSubmitted(true);
        } catch (err) { alert(err.message); }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">Quiz Completed!</h1>
                <p className="text-xl">Your Score: <span className="text-blue-600 font-black">{score}</span></p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-4 px-8 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 space-y-8">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Quiz Session</h1>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <motion.div
                        key={q.QuestionID}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"
                    >
                        <p className="text-lg font-bold text-slate-800 dark:text-white mb-6">
                            <span className="text-blue-600 mr-2">#{idx+1}</span> {q.QuestionText}
                        </p>
                        <div className="space-y-3">
                            {q.options?.map(opt => (
                                <button
                                    key={opt.OptionID}
                                    onClick={() => setAnswers({...answers, [q.QuestionID]: opt.OptionID})}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                        answers[q.QuestionID] === opt.OptionID
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30'
                                    }`}
                                >
                                    {opt.OptionText}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length}
                className="w-full p-6 bg-slate-900 dark:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
                Finalize & Submit
            </button>
        </div>
    );
};

export default QuizTaker;
