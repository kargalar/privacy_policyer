import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
    GET_QUESTIONS_QUERY,
    GENERATE_DOCUMENTS_MUTATION,
} from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader, LogOut } from 'lucide-react';

const CreatePage = () => {
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const { data: questionsData, loading: questionsLoading } = useQuery(
        GET_QUESTIONS_QUERY
    );

    const [generateDocuments, { loading: generating }] = useMutation(
        GENERATE_DOCUMENTS_MUTATION,
        {
            onCompleted: (data) => {
                console.log('✓ Document created:', data);
                // Hemen document page'e yönlendir
                navigate(`/documents/${data.generateDocuments.id}`);
            },
            onError: (error) => {
                console.error('✗ Error creating document:', error);
                setError(error.message || 'Failed to create documents');
            },
        }
    );

    if (!isAuthenticated || (user?.status !== 'APPROVED' && user?.status !== 'ADMIN')) {
        navigate('/documents');
        return null;
    }

    const questions = questionsData?.questions || [];

    const handleAnswerChange = (questionId, value) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Check if all required questions are answered
        const allAnswered = questions
            .filter((q) => q.required)
            .every((q) => answers[q.id]);

        if (!allAnswered) {
            setError('Please answer all required questions');
            return;
        }

        const answerInputs = questions
            .filter((q) => answers[q.id])
            .map((q) => ({
                questionId: q.id,
                value: answers[q.id].toString(),
            }));

        // Use first question answer as appName
        const firstQuestion = questions[0];
        const appNameFromAnswers = answers[firstQuestion?.id];

        await generateDocuments({
            variables: {
                appName: appNameFromAnswers || 'Application',
                answers: answerInputs,
            },
        });
    };

    if (questionsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="text-gray-600 text-sm">Document Creator</div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">User</p>
                            <p className="text-sm font-semibold text-gray-900">@{user?.username}</p>
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create New Document
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Please answer the questions below
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Questions */}
                    {questions.map((question, index) => (
                        <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
                            <label className="block text-lg font-semibold text-gray-900 mb-2">
                                {index + 1}. {question.question}
                                {question.required && <span className="text-red-600 ml-1">*</span>}
                            </label>

                            {question.description && (
                                <p className="text-gray-600 text-sm mb-4">
                                    {question.description}
                                </p>
                            )}

                            {question.type === 'TEXT' && (
                                <input
                                    type="text"
                                    value={answers[question.id] || ''}
                                    onChange={(e) =>
                                        handleAnswerChange(question.id, e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Enter your answer..."
                                />
                            )}

                            {question.type === 'EMAIL' && (
                                <input
                                    type="email"
                                    value={answers[question.id] || ''}
                                    onChange={(e) =>
                                        handleAnswerChange(question.id, e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="email@example.com"
                                />
                            )}

                            {question.type === 'TEXTAREA' && (
                                <textarea
                                    value={answers[question.id] || ''}
                                    onChange={(e) =>
                                        handleAnswerChange(question.id, e.target.value)
                                    }
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Enter your detailed answer..."
                                />
                            )}

                            {question.type === 'SELECT' && (
                                <select
                                    value={answers[question.id] || ''}
                                    onChange={(e) =>
                                        handleAnswerChange(question.id, e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    {question.options?.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {question.type === 'BOOLEAN' && (
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={question.id}
                                            value="true"
                                            checked={answers[question.id] === 'true'}
                                            onChange={(e) =>
                                                handleAnswerChange(question.id, e.target.value)
                                            }
                                            className="w-4 h-4"
                                        />
                                        <span>Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={question.id}
                                            value="false"
                                            checked={answers[question.id] === 'false'}
                                            onChange={(e) =>
                                                handleAnswerChange(question.id, e.target.value)
                                            }
                                            className="w-4 h-4"
                                        />
                                        <span>No</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Submit Button */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <button
                            type="submit"
                            disabled={generating}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {generating && <Loader className="w-4 h-4 animate-spin" />}
                            {generating
                                ? 'Generating documents...'
                                : 'Generate Documents'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreatePage;
