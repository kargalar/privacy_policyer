import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import {
    GET_DOCUMENT_QUERY,
    APPROVE_DOCUMENT_MUTATION,
    PUBLISH_DOCUMENT_MUTATION,
    UNPUBLISH_DOCUMENT_MUTATION,
    DELETE_DOCUMENT_MUTATION,
} from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import {
    AlertCircle,
    Loader,
    Download,
    CheckCircle,
    Globe,
    ArrowLeft,
    Copy,
    ExternalLink,
    Trash2,
    RotateCcw,
} from 'lucide-react';

const DocumentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState('privacy');
    const [copiedUrl, setCopiedUrl] = useState(null);

    const { data: documentData, loading, refetch, stopPolling } = useQuery(GET_DOCUMENT_QUERY, {
        variables: { id },
        skip: !isAuthenticated,
        pollInterval: 2000, // Her 2 saniyede bir refresh et
        fetchPolicy: 'cache-and-network', // Cache'den oku ama network'ten de al
    });

    // Doküman hazırlanırken polling yap, hazır olunca durdur
    useEffect(() => {
        if (documentData?.document?.privacyPolicy && documentData?.document?.termsOfService) {
            stopPolling();
        }
    }, [documentData, stopPolling]);

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

    const [unpublishDocument, { loading: unpublishing }] = useMutation(
        UNPUBLISH_DOCUMENT_MUTATION,
        {
            onCompleted: () => {
                alert('Doküman yayından kaldırıldı!');
            },
            onError: (error) => {
                alert('Hata: ' + error.message);
            },
        }
    );

    const [deleteDocumentMutation, { loading: deleting }] = useMutation(
        DELETE_DOCUMENT_MUTATION,
        {
            onCompleted: () => {
                alert('Doküman silindi!');
                navigate('/documents');
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
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Dokümanlar Oluşturuluyor
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Yapay zeka tarafından özel dokümanlarınız oluşturuluyor...
                    </p>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <p className="text-sm text-indigo-700">
                            ⏱️ Bu işlem birkaç dakika sürebilir. Lütfen sayfayı kapatmayın.
                        </p>
                    </div>
                </div>
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

    const handleUnpublish = () => {
        if (window.confirm('Bu dokümanı yayından kaldırmak istediğinizden emin misiniz? Halk tarafından erişilemez hale gelecektir.')) {
            unpublishDocument({ variables: { documentId: id } });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Bu dokümanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            deleteDocumentMutation({ variables: { documentId: id } });
        }
    };

    const normalizeAppName = (name) => {
        return name.trim().replace(/\s+/g, '-').toLowerCase();
    };

    const getPublicUrl = (type) => {
        const normalizedAppName = normalizeAppName(document.appName);
        return `${window.location.origin}/public/${user?.username || 'username'}/${normalizedAppName}/${type}`;
    };

    const copyToClipboard = (url, type) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(type);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const openUrl = (url) => {
        window.open(url, '_blank');
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
                                Dokümanları inceledikten sonra yayınlayabilirsiniz
                            </p>
                        </div>
                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
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

                {document.status === 'PUBLISHED' && (
                    <div className="mb-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-purple-900">
                                Dokümanlar Yayınlandı! 🎉
                            </h2>
                        </div>
                        <p className="text-purple-700 text-sm mb-4">
                            Dokümanlarınız artık herkese açık URL'ler aracılığıyla erişilebilir:
                        </p>
                        <div className="space-y-3">
                            <div className="bg-white rounded p-4 border border-purple-200">
                                <p className="text-xs text-purple-600 mb-2 font-semibold">Privacy Policy URL:</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <code className="text-xs bg-purple-50 px-3 py-2 rounded flex-1 min-w-0 text-gray-700 break-all font-mono">
                                        {getPublicUrl('privacypolicy')}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(getPublicUrl('privacypolicy'), 'privacy')}
                                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded transition"
                                        title="Kopyala"
                                    >
                                        {copiedUrl === 'privacy' ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-purple-600" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => openUrl(getPublicUrl('privacypolicy'))}
                                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded transition"
                                        title="Siteyi Aç"
                                    >
                                        <ExternalLink className="w-4 h-4 text-purple-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded p-4 border border-purple-200">
                                <p className="text-xs text-purple-600 mb-2 font-semibold">Terms of Service URL:</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <code className="text-xs bg-purple-50 px-3 py-2 rounded flex-1 min-w-0 text-gray-700 break-all font-mono">
                                        {getPublicUrl('termsofservice')}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(getPublicUrl('termsofservice'), 'terms')}
                                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded transition"
                                        title="Kopyala"
                                    >
                                        {copiedUrl === 'terms' ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-purple-600" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => openUrl(getPublicUrl('termsofservice'))}
                                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded transition"
                                        title="Siteyi Aç"
                                    >
                                        <ExternalLink className="w-4 h-4 text-purple-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6 pt-6 border-t border-purple-200">
                            <button
                                onClick={handleUnpublish}
                                disabled={unpublishing}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition disabled:opacity-50 font-medium"
                            >
                                <RotateCcw className="w-4 h-4" />
                                {unpublishing ? 'Kaldırılıyor...' : 'Yayından Kaldır'}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 font-medium ml-auto"
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleting ? 'Siliniyor...' : 'Sil'}
                            </button>
                        </div>
                    </div>
                )}

                {/* DRAFT ve Published olmayan dokümanlar için Delete butonu */}
                {document.status === 'DRAFT' && (
                    <div className="mb-8 flex justify-end">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            {deleting ? 'Siliniyor...' : 'Dokümanı Sil'}
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
