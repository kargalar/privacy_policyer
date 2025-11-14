import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, Settings } from 'lucide-react';

const DashboardPage = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Privacy Policy Generator
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">{user?.email}</span>
                        {user?.isAdmin && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                Admin
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {user?.status === 'PENDING' && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h2 className="font-semibold text-yellow-800 mb-2">
                            ⏳ Account Pending Approval
                        </h2>
                        <p className="text-yellow-700">
                            Your account is waiting for admin approval. Once approved, you'll have access to all features.
                        </p>
                    </div>
                )}

                {user?.status === 'REJECTED' && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="font-semibold text-red-800 mb-2">
                            ❌ Account Rejected
                        </h2>
                        <p className="text-red-700">
                            Unfortunately, your account has been rejected by the administrator. Please contact us for more information.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create Document */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Create Document
                            </h2>
                            <FileText className="w-8 h-8 text-indigo-600" />
                        </div>
                        <p className="text-gray-600 mb-6">
                            Answer a few questions to create Privacy Policy and Terms of Service documents.
                        </p>
                        <Link
                            to="/create"
                            disabled={user?.status !== 'APPROVED'}
                            className={`inline-block px-6 py-2 rounded-lg font-medium transition ${user?.status === 'APPROVED'
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* My Documents */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                My Documents
                            </h2>
                            <FileText className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-gray-600 mb-6">
                            Access all the Privacy Policy and Terms of Service documents you've created.
                        </p>
                        <Link
                            to="/documents"
                            disabled={user?.status !== 'APPROVED'}
                            className={`inline-block px-6 py-2 rounded-lg font-medium transition ${user?.status === 'APPROVED'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            View
                        </Link>
                    </div>

                    {/* Admin Panel */}
                    {user?.isAdmin && (
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Admin Panel
                                </h2>
                                <Settings className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-gray-600 mb-6">
                                Approve or reject new users and manage the system.
                            </p>
                            <Link
                                to="/admin"
                                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                            >
                                Admin Panel
                            </Link>
                        </div>
                    )}
                </div>

                {/* Information Cards */}
                <div className="mt-12 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-indigo-600 font-bold text-lg">1</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Answer Questions</h3>
                            <p className="text-sm text-gray-600">
                                Answer a few questions about your application
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-indigo-600 font-bold text-lg">2</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">AI Generation</h3>
                            <p className="text-sm text-gray-600">
                                Documents are generated automatically using Gemini AI
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-indigo-600 font-bold text-lg">3</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Review</h3>
                            <p className="text-sm text-gray-600">
                                Make decisions about generated documents
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-indigo-600 font-bold text-lg">4</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Publish</h3>
                            <p className="text-sm text-gray-600">
                                Publish your documents and make them publicly available
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
