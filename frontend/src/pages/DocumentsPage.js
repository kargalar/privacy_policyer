import React from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_MY_DOCUMENTS_QUERY } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import {
    FileText,
    Loader,
    ArrowRight,
    Plus,
    LogOut,
    CheckCircle,
} from 'lucide-react';

const DocumentsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const { data: documentsData, loading } = useQuery(GET_MY_DOCUMENTS_QUERY, {
        skip: !isAuthenticated,
    });

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const documents = documentsData?.myDocuments || [];

    const getStatusBadge = (status) => {
        const statusConfig = {
            DRAFT: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' },
            APPROVED: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                label: 'Approved',
            },
            PUBLISHED: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: 'Published',
            },
        };

        const config = statusConfig[status] || statusConfig.DRAFT;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                My Documents
                            </h1>
                            <p className="text-gray-600 mt-2">
                                All documents you've created
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Welcome</p>
                                <p className="text-lg font-semibold text-gray-900">@{user?.username}</p>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        {user?.status === 'ADMIN' && (
                            <button
                                onClick={() => navigate('/approvals')}
                                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Pending Approvals
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/create')}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            New Document
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {documents.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            No Documents Created Yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Create a new document to get started
                        </p>
                        <button
                            onClick={() => navigate('/create')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Document
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                                onClick={() => navigate(`/documents/${doc.id}`)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <FileText className="w-8 h-8 text-indigo-600" />
                                    {getStatusBadge(doc.status)}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {doc.appName}
                                </h3>

                                <p className="text-sm text-gray-600 mb-4">
                                    Created: {new Date(doc.createdAt).toLocaleDateString('en-US')}
                                </p>

                                <div className="flex items-center gap-2 text-indigo-600 font-medium group">
                                    View Details
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DocumentsPage;
