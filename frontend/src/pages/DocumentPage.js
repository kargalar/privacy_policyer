import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import {
    GET_DOCUMENT_QUERY,
    APPROVE_DOCUMENT_MUTATION,
    PUBLISH_DOCUMENT_MUTATION,
} from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import {
    AlertCircle,
    Loader,
    Download,
    CheckCircle,
    Globe,
    ArrowLeft,
} from 'lucide-react';

const DocumentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState('privacy');

    const { data: documentData, loading } = useQuery(GET_DOCUMENT_QUERY, {
        variables: { id },
        skip: !isAuthenticated,
    });

    const [approveDocument, { loading: approving }] = useMutation(
        APPROVE_DOCUMENT_MUTATION,
        {
            onCompleted: () => {
                alert('Doküman onaylandı!');
            },
            onError: (error) => {
                alert('Hata: ' + error.message);
            },
        }
    );

    const [publishDocument, { loading: publishing }] = useMutation(
        PUBLISH_DOCUMENT_MUTATION,
        {
            onCompleted: () => {
                alert('Doküman yayınlandı!');
            },
            onError: (error) => {
                alert('Hata: ' + error.message);
            },
        }
    );

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

    const document = documentData?.document;

    if (!document) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <button
                            onClick={() => navigate('/documents')}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Geri Dön
                        </button>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Doküman Bulunamadı
                        </h1>
                    </div>
                </main>
            </div>
        );
    }

    const handleApprove = () => {
        if (window.confirm('Bu dokümanı onaylamak istediğinizden emin misiniz?')) {
            approveDocument({ variables: { documentId: id } });
        }
    };

    const handlePublish = () => {
        if (window.confirm('Bu dokümanı yayınlamak istediğinizden emin misiniz?')) {
            publishDocument({ variables: { documentId: id } });
        }
    };

    const handleDownload = (type) => {
        const content = type === 'privacy' ? document.privacyPolicy : document.termsOfService;
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = `${document.appName}-${type === 'privacy' ? 'privacy-policy' : 'terms-of-service'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => navigate('/documents')}
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-3"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Geri Dön
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {document.appName}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Oluşturma Tarihi: {new Date(document.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {document.status === 'DRAFT' && (
                                <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium">
                                    Taslak
                                </span>
                            )}
                            {document.status === 'APPROVED' && (
                                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Onaylı
                                </span>
                            )}
                            {document.status === 'PUBLISHED' && (
                                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Yayınlandı
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Action Buttons */}
                {document.status === 'DRAFT' && (
                    <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-blue-900 mb-1">
                                Doküman Taslak Durumunda
                            </h2>
                            <p className="text-blue-700 text-sm">
                                Dokümanları inceledikten sonra onaylayabilirsiniz
                            </p>
                        </div>
                        <button
                            onClick={handleApprove}
                            disabled={approving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {approving ? 'Onaylanıyor...' : 'Onayla'}
                        </button>
                    </div>
                )}

                {document.status === 'APPROVED' && (
                    <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-green-900 mb-1">
                                Doküman Onaylandı
                            </h2>
                            <p className="text-green-700 text-sm">
                                Dokümanları yayınlayabilirsiniz
                            </p>
                        </div>
                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {publishing ? 'Yayınlanıyor...' : (
                                <>
                                    <Globe className="w-4 h-4" />
                                    Yayınla
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="mb-6 flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`px-6 py-3 font-medium border-b-2 transition ${activeTab === 'privacy'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Privacy Policy
                    </button>
                    <button
                        onClick={() => setActiveTab('terms')}
                        className={`px-6 py-3 font-medium border-b-2 transition ${activeTab === 'terms'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Terms of Service
                    </button>
                </div>

                {/* Document Content */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() =>
                                handleDownload(activeTab === 'privacy' ? 'privacy' : 'terms')
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Download className="w-4 h-4" />
                            İndir
                        </button>
                    </div>

                    <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {activeTab === 'privacy'
                                ? document.privacyPolicy
                                : document.termsOfService}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DocumentPage;
