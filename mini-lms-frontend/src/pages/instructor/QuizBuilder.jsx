import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPost, apiDelete } from '../../services/api';
import { Trash2, Plus, Check, Save } from 'lucide-react';

const QuizBuilder = () => {
    const { id: quizId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        type: 'MCQ',
        points: 1,
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false }
        ]
    });

    useEffect(() => {
        loadQuestions();
    }, [quizId]);

    const loadQuestions = async () => {
        try {
            const data = await apiGet(`/quizzes/${quizId}/questions`);
            setQuestions(data || []);
        } catch (err) { console.error(err); }
    };

    const handleAddOption = () => {
        setNewQuestion({
            ...newQuestion,
            options: [...newQuestion.options, { text: '', isCorrect: false }]
        });
    };

    const handleSaveQuestion = async () => {
        try {
            await apiPost('/quizzes/questions', { ...newQuestion, quizId });
            setNewQuestion({
                text: '',
                type: 'MCQ',
                points: 1,
                options: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false }
                ]
            });
            loadQuestions();
        } catch (err) { alert(err.message); }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm("Delete this question?")) {
            try {
                await apiDelete(`/quizzes/questions/${id}`);
                loadQuestions();
            } catch (err) { console.error(err); }
        }
    };

    return (
        <div className="space-y-8 p-6">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Quiz Builder</h1>

            {/* Existing Questions */}
            <div className="space-y-4">
                {questions.map((q, idx) => (
                    <div key={q.QuestionID} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 relative">
                        <button
                            onClick={() => handleDeleteQuestion(q.QuestionID)}
                            className="absolute top-4 right-4 text-red-500 hover:scale-110 transition-transform"
                        >
                            <Trash2 size={18} />
                        </button>
                        <p className="font-bold text-slate-800 dark:text-white">Q{idx+1}: {q.QuestionText}</p>
                        <div className="mt-2 space-y-1">
                            {q.options?.map(opt => (
                                <div key={opt.OptionID} className={`text-xs p-1 px-2 rounded-lg ${opt.IsCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-500'}`}>
                                    • {opt.OptionText} {opt.IsCorrect && '(Correct)'}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* New Question Form */}
            <div className="p-6 bg-blue-50/50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-500/20 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Add New Question</h3>
                <textarea
                    value={newQuestion.text}
                    onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                    placeholder="Question text..."
                    className="w-full p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10"
                />
                <div className="space-y-2">
                    {newQuestion.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                value={opt.text}
                                onChange={e => {
                                    const next = [...newQuestion.options];
                                    next[idx].text = e.target.value;
                                    setNewQuestion({...newQuestion, options: next});
                                }}
                                placeholder={`Option ${idx+1}`}
                                className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs"
                            />
                            <button
                                onClick={() => {
                                    const next = newQuestion.options.map((o, i) => ({...o, isCorrect: i === idx}));
                                    setNewQuestion({...newQuestion, options: next});
                                }}
                                className={`p-2 rounded-lg ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                                <Check size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={handleAddOption} className="flex items-center gap-2 text-xs font-black uppercase bg-slate-200 dark:bg-slate-800 p-2 px-4 rounded-xl">
                        <Plus size={14} /> Add Option
                    </button>
                    <button onClick={handleSaveQuestion} className="flex items-center gap-2 text-xs font-black uppercase bg-blue-600 text-white p-2 px-4 rounded-xl">
                        <Save size={14} /> Save Question
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizBuilder;
