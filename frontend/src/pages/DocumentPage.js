import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import {
    GET_DOCUMENT_QUERY,
    PUBLISH_DOCUMENT_MUTATION,
    UNPUBLISH_DOCUMENT_MUTATION,
    DELETE_DOCUMENT_MUTATION,
    UPDATE_DOCUMENT_MUTATION,
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
    Edit2,
    X,
    Check,
    LogOut,
} from 'lucide-react';

const DocumentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('privacy');
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        appName: '',
        privacyPolicy: '',
        termsOfService: '',
    });

    const { data: documentData, loading, refetch, stopPolling } = useQuery(GET_DOCUMENT_QUERY, {
        variables: { id },
        skip: !isAuthenticated,
        pollInterval: 2000, // Her 2 saniyede bir refresh et
        fetchPolicy: 'cache-and-network', // Cache'den oku ama network'ten de al
    });

    // Poll while document is being prepared, stop when ready
    useEffect(() => {
        if (documentData?.document?.privacyPolicy && documentData?.document?.termsOfService) {
            stopPolling();
        }
    }, [documentData, stopPolling]);

    const [publishDocument, { loading: publishing }] = useMutation(
        PUBLISH_DOCUMENT_MUTATION,
        {
            onCompleted: () => {
                alert('Document published!');
            },
            onError: (error) => {
                alert('Error: ' + error.message);
            },
        }
    );

    const [unpublishDocument, { loading: unpublishing }] = useMutation(
        UNPUBLISH_DOCUMENT_MUTATION,
        {
            onCompleted: () => {
                alert('Document unpublished!');
            },
            onError: (error) => {
                alert('Error: ' + error.message);
            },
        }
    );

    const [deleteDocumentMutation, { loading: deleting }] = useMutation(
        DELETE_DOCUMENT_MUTATION,
        {
            onCompleted: () => {
                alert('Document deleted!');
                navigate('/documents');
            },
            onError: (error) => {
                alert('Error: ' + error.message);
            },
        }
    );

    const [updateDocumentMutation] = useMutation(
        UPDATE_DOCUMENT_MUTATION,
        {
            onCompleted: () => {
                alert('Document updated!');
                setIsEditing(false);
                refetch();
            },
            onError: (error) => {
                alert('Error: ' + error.message);
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
                        Documents Are Being Generated
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Your custom documents are being created by artificial intelligence...
                    </p>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <p className="text-sm text-indigo-700">
                            ⏱️ This process may take a few minutes. Please don't close the page.
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
                            Back
                        </button>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Document Not Found
                        </h1>
                    </div>
                </main>
            </div>
        );
    }

    const handlePublish = () => {
        if (window.confirm('Are you sure you want to publish this document?')) {
            publishDocument({ variables: { documentId: id } });
        }
    };

    const handleUnpublish = () => {
        if (window.confirm('Are you sure you want to unpublish this document? It will no longer be accessible to the public.')) {
            unpublishDocument({ variables: { documentId: id } });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this document? This action cannot be undone!')) {
            deleteDocumentMutation({ variables: { documentId: id } });
        }
    };

    const handleEditStart = () => {
        setEditData({
            appName: document.appName,
            privacyPolicy: document.privacyPolicy,
            termsOfService: document.termsOfService,
        });
        setIsEditing(true);
    };

    const handleEditSave = () => {
        if (!editData.appName.trim() || !editData.privacyPolicy.trim() || !editData.termsOfService.trim()) {
            alert('Lütfen tüm alanları doldurun');
            return;
        }
        updateDocumentMutation({
            variables: {
                documentId: id,
                appName: editData.appName,
                privacyPolicy: editData.privacyPolicy,
                termsOfService: editData.termsOfService,
            },
        });
    };

    const handleEditCancel = () => {
        setIsEditing(false);
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
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="text-gray-600 text-sm">Document Editor</div>
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
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => navigate('/documents')}
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-3"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {document.appName}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Created: {new Date(document.createdAt).toLocaleDateString('en-US')}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {document.status === 'DRAFT' && (
                                <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium">
                                    Draft
                                </span>
                            )}
                            {document.status === 'APPROVED' && (
                                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Approved
                                </span>
                            )}
                            {document.status === 'PUBLISHED' && (
                                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Published
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
                                Document is in Draft Status
                            </h2>
                            <p className="text-blue-700 text-sm">
                                You can publish the documents after reviewing them
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleEditStart}
                                className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={publishing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {publishing ? 'Publishing...' : (
                                    <>
                                        <Globe className="w-4 h-4" />
                                        Publish
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {document.status === 'PUBLISHED' && (
                    <div className="mb-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-purple-900">
                                Documents Published! 🎉
                            </h2>
                        </div>
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
                                        title="Copy"
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
                                        title="Open Site"
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
                                        title="Copy"
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
                                        title="Open Site"
                                    >
                                        <ExternalLink className="w-4 h-4 text-purple-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded p-4 border border-purple-200">
                                <p className="text-xs text-purple-600 mb-2 font-semibold">Delete Request URL:</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <code className="text-xs bg-purple-50 px-3 py-2 rounded flex-1 min-w-0 text-gray-700 break-all font-mono">
                                        {`${window.location.origin}/documents/${id}/delete-request`}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/documents/${id}/delete-request`, 'delete')}
                                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded transition"
                                        title="Copy"
                                    >
                                        {copiedUrl === 'delete' ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-purple-600" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => openUrl(`${window.location.origin}/documents/${id}/delete-request`)}
                                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded transition"
                                        title="Open Site"
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
                                {unpublishing ? 'Removing...' : 'Unpublish'}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 font-medium ml-auto"
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete button for DRAFT and non-published documents */}
                {document.status === 'DRAFT' && (
                    <div className="mb-8 flex justify-end">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            {deleting ? 'Deleting...' : 'Delete Document'}
                        </button>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="mb-6 flex gap-2 border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${activeTab === 'privacy'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Privacy Policy
                    </button>
                    <button
                        onClick={() => setActiveTab('terms')}
                        className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${activeTab === 'terms'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Terms of Service
                    </button>
                    {document.deleteRequests && document.deleteRequests.length > 0 && (
                        <button
                            onClick={() => setActiveTab('deletions')}
                            className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${activeTab === 'deletions'
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Deletion Requests ({document.deleteRequests.length})
                        </button>
                    )}
                </div>

                {/* Document Content */}
                {activeTab !== 'deletions' && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={() =>
                                    handleDownload(activeTab === 'privacy' ? 'privacy' : 'terms')
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                <Download className="w-4 h-4" />
                                Download
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
                )}

                {/* Deletion Requests Tab */}
                {activeTab === 'deletions' && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            Account Deletion Requests
                        </h2>

                        {document.deleteRequests && document.deleteRequests.length > 0 ? (
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-red-800">
                                        These users have requested account deletion. You should process these requests
                                        according to your privacy policy and legal obligations.
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Requested Date</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Days Ago</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {document.deleteRequests.map((request) => {
                                                const requestDate = new Date(request.createdAt);
                                                const now = new Date();
                                                const daysAgo = Math.floor((now - requestDate) / (1000 * 60 * 60 * 24));

                                                return (
                                                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-gray-900 font-medium break-all">
                                                            {request.email}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-600 text-sm">
                                                            {requestDate.toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-600 text-sm">
                                                            {daysAgo === 0 ? 'Today' : `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <p className="text-gray-600">No deletion requests yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-96 overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Document</h3>
                                <button
                                    onClick={handleEditCancel}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-4">
                                {/* App Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Application Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.appName}
                                        onChange={(e) =>
                                            setEditData({ ...editData, appName: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                {/* Privacy Policy */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Privacy Policy
                                    </label>
                                    <textarea
                                        value={editData.privacyPolicy}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                privacyPolicy: e.target.value,
                                            })
                                        }
                                        rows="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                                    />
                                </div>

                                {/* Terms of Service */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Terms of Service
                                    </label>
                                    <textarea
                                        value={editData.termsOfService}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                termsOfService: e.target.value,
                                            })
                                        }
                                        rows="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                                <button
                                    onClick={handleEditCancel}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSave}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DocumentPage;
