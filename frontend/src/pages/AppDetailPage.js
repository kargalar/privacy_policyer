import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import {
    GET_DOCUMENT_QUERY,
    GET_APP_IMAGES_QUERY,
    PUBLISH_DOCUMENT_MUTATION,
    UNPUBLISH_DOCUMENT_MUTATION,
    DELETE_DOCUMENT_MUTATION,
    UPDATE_DOCUMENT_MUTATION,
    GENERATE_APP_IMAGE_MUTATION,
    DELETE_APP_IMAGE_MUTATION,
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
    FileText,
    Image,
    Smartphone,
    Sparkles,
    RefreshCw,
    Upload,
} from 'lucide-react';

// Style options with preview images and descriptions
const STYLE_OPTIONS = [
    { id: 'retro', name: 'Retro', color: 'from-pink-500 to-purple-600', emoji: '🎨' },
    { id: 'cartoon', name: 'Cartoon', color: 'from-cyan-400 to-teal-500', emoji: '💡' },
    { id: 'geometric', name: 'Geometric', color: 'from-orange-500 to-red-600', emoji: '🦁' },
    { id: 'neon', name: 'Neon', color: 'from-purple-600 to-pink-500', emoji: '🔧' },
    { id: 'clay', name: 'Clay', color: 'from-amber-400 to-orange-500', emoji: '🍔' },
    { id: 'abstract', name: 'Abstract', color: 'from-teal-500 to-cyan-400', emoji: '🎭' },
    { id: 'lineal', name: 'Lineal', color: 'from-pink-400 to-rose-500', emoji: '🐬' },
    { id: '3d', name: '3D', color: 'from-indigo-500 to-purple-600', emoji: '🔔' },
    { id: 'pixel', name: 'Pixel', color: 'from-yellow-200 to-amber-300', emoji: '🥕' },
    { id: 'origami', name: 'Origami', color: 'from-pink-100 to-rose-200', emoji: '🐓' },
    { id: 'minimal', name: 'Minimal', color: 'from-indigo-600 to-purple-700', emoji: '👤' },
    { id: 'gradient', name: 'Gradient', color: 'from-yellow-400 to-red-500', emoji: '⭐' },
    { id: 'steel', name: 'Steel', color: 'from-slate-400 to-gray-600', emoji: '🚀' },
    { id: 'fibonacci', name: 'Fibonacci', color: 'from-amber-600 to-orange-700', emoji: '🦊' },
    { id: 'bw', name: 'B&W', color: 'from-gray-200 to-gray-400', emoji: '🌳' },
    { id: 'crayon', name: 'Crayon', color: 'from-green-400 to-yellow-400', emoji: '🏠' },
    { id: 'sticker', name: 'Sticker', color: 'from-green-300 to-emerald-400', emoji: '🍃' },
    { id: 'watercolor', name: 'Watercolor', color: 'from-pink-300 to-rose-400', emoji: '🐦' },
];

const AppDetailPage = () => {
    const { id, tab: urlTab } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const [mainTab, setMainTab] = useState(urlTab || 'documents');
    const [documentTab, setDocumentTab] = useState('privacy');
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        appName: '',
        appDescription: '',
        privacyPolicy: '',
        termsOfService: '',
    });

    // Image generation state
    const [imageType, setImageType] = useState('APP_ICON');
    const [imageStyle, setImageStyle] = useState('origami'); // Default style
    const [imagePrompt, setImagePrompt] = useState('');
    const [referenceImages, setReferenceImages] = useState([]);
    const [generatingCount, setGeneratingCount] = useState(0); // Track number of images being generated
    const [transparentBackground, setTransparentBackground] = useState(false); // For app icons
    const [showAllStyles, setShowAllStyles] = useState(false); // For expanding style grid

    const { data: documentData, loading, refetch, stopPolling } = useQuery(GET_DOCUMENT_QUERY, {
        variables: { id },
        skip: !isAuthenticated,
        pollInterval: 2000,
        fetchPolicy: 'cache-and-network',
    });

    const { data: imagesData, loading: imagesLoading, refetch: refetchImages } = useQuery(GET_APP_IMAGES_QUERY, {
        variables: { documentId: id },
        skip: !isAuthenticated,
        fetchPolicy: 'cache-and-network',
    });

    useEffect(() => {
        if (documentData?.document?.privacyPolicy && documentData?.document?.termsOfService) {
            stopPolling();
        }
    }, [documentData, stopPolling]);

    useEffect(() => {
        if (urlTab && ['documents', 'images'].includes(urlTab)) {
            setMainTab(urlTab);
        }
    }, [urlTab]);

    const [publishDocument, { loading: publishing }] = useMutation(PUBLISH_DOCUMENT_MUTATION, {
        onCompleted: () => alert('Document published!'),
        onError: (error) => alert('Error: ' + error.message),
    });

    const [unpublishDocument, { loading: unpublishing }] = useMutation(UNPUBLISH_DOCUMENT_MUTATION, {
        onCompleted: () => alert('Document unpublished!'),
        onError: (error) => alert('Error: ' + error.message),
    });

    const [deleteDocumentMutation, { loading: deleting }] = useMutation(DELETE_DOCUMENT_MUTATION, {
        onCompleted: () => {
            alert('Document deleted!');
            navigate('/apps');
        },
        onError: (error) => alert('Error: ' + error.message),
    });

    const [updateDocumentMutation] = useMutation(UPDATE_DOCUMENT_MUTATION, {
        onCompleted: () => {
            alert('Document updated!');
            setIsEditing(false);
            refetch();
        },
        onError: (error) => alert('Error: ' + error.message),
    });

    const [generateAppImageMutation] = useMutation(GENERATE_APP_IMAGE_MUTATION, {
        onCompleted: () => {
            setGeneratingCount(prev => Math.max(0, prev - 1));
            refetchImages();
            // No alert - silently complete
        },
        onError: (error) => {
            setGeneratingCount(prev => Math.max(0, prev - 1));
            let errorMessage = error.message;
            if (error.message.includes('request entity too large') || error.message.includes('PayloadTooLarge')) {
                errorMessage = 'Reference images are too large. Please use smaller images (max 5MB each).';
            } else if (error.networkError) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            alert('Error generating image: ' + errorMessage);
        },
    });

    const [deleteAppImageMutation] = useMutation(DELETE_APP_IMAGE_MUTATION, {
        onCompleted: () => {
            refetchImages();
            alert('Image deleted!');
        },
        onError: (error) => alert('Error: ' + error.message),
    });

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading App...</h2>
                    <p className="text-gray-600 mb-4">Please wait while we load your app data.</p>
                </div>
            </div>
        );
    }

    const document = documentData?.document;
    const appImages = imagesData?.appImages || [];

    if (!document) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <button
                            onClick={() => navigate('/apps')}
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">App Not Found</h1>
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
        if (window.confirm('Are you sure you want to unpublish this document?')) {
            unpublishDocument({ variables: { documentId: id } });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this app? This action cannot be undone!')) {
            deleteDocumentMutation({ variables: { documentId: id } });
        }
    };

    const handleEditStart = () => {
        setEditData({
            appName: document.appName,
            appDescription: document.appDescription || '',
            privacyPolicy: document.privacyPolicy,
            termsOfService: document.termsOfService,
        });
        setIsEditing(true);
    };

    const handleEditSave = () => {
        if (!editData.appName.trim() || !editData.privacyPolicy.trim() || !editData.termsOfService.trim()) {
            alert('Please fill all required fields');
            return;
        }
        updateDocumentMutation({
            variables: {
                documentId: id,
                appName: editData.appName,
                appDescription: editData.appDescription,
                privacyPolicy: editData.privacyPolicy,
                termsOfService: editData.termsOfService,
            },
        });
    };

    const handleGenerateImage = () => {
        // Store Screenshot requires at least 1 reference image (app screenshot)
        if (imageType === 'STORE_SCREENSHOT' && referenceImages.length === 0) {
            alert('Store Screenshot requires at least 1 app screenshot. Please upload your app screenshot first.');
            return;
        }

        setGeneratingCount(prev => prev + 1);
        generateAppImageMutation({
            variables: {
                documentId: id,
                imageType,
                style: imageStyle,
                prompt: imagePrompt,
                referenceImages: referenceImages.length > 0 ? referenceImages : null,
                transparentBackground: imageType === 'APP_ICON' ? transparentBackground : false,
            },
        });
        // Clear prompt and references after starting generation
        setImagePrompt('');
        setReferenceImages([]);
    };

    const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Scale down if too large
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedBase64);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleReferenceImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const maxImages = 3; // Maximum reference images
        const maxSizePerImage = 5 * 1024 * 1024; // 5MB per image

        for (const file of files.slice(0, maxImages - referenceImages.length)) {
            // Check file size - if too large, compress it
            if (file.size > maxSizePerImage) {
                try {
                    const compressedImage = await compressImage(file, 1024, 0.7);
                    setReferenceImages(prev => {
                        if (prev.length >= maxImages) return prev;
                        return [...prev, compressedImage];
                    });
                } catch (error) {
                    alert(`Image "${file.name}" is too large and could not be compressed.`);
                }
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setReferenceImages(prev => {
                        if (prev.length >= maxImages) return prev;
                        return [...prev, event.target.result];
                    });
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const removeReferenceImage = (index) => {
        setReferenceImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteImage = (imageId) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            deleteAppImageMutation({ variables: { imageId } });
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
        const element = window.document.createElement('a');
        const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = `${document.appName}-${type === 'privacy' ? 'privacy-policy' : 'terms-of-service'}.txt`;
        window.document.body.appendChild(element);
        element.click();
        window.document.body.removeChild(element);
    };

    const handleDownloadImage = async (imageUrl, imageName) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement('a');
            link.href = url;
            link.download = imageName;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to download image');
        }
    };

    const getImageTypeLabel = (type) => {
        const labels = {
            APP_ICON: 'App Icon',
            FEATURE_GRAPHIC: 'Feature Graphic',
            STORE_SCREENSHOT: 'Store Screenshot',
        };
        return labels[type] || type;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="text-gray-600 text-sm">App Manager</div>
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
                                onClick={() => navigate('/apps')}
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-3"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Apps
                            </button>
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{document.appName}</h1>
                                    <p className="text-gray-600 mt-1">
                                        Created: {new Date(document.createdAt).toLocaleDateString('en-US')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {document.status === 'DRAFT' && (
                                <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium">Draft</span>
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

                    {/* Main Tab Navigation */}
                    <div className="mt-6 flex gap-4 border-b border-gray-200">
                        <button
                            onClick={() => {
                                setMainTab('documents');
                                navigate(`/apps/${id}/documents`);
                            }}
                            className={`px-6 py-3 font-medium border-b-2 transition flex items-center gap-2 ${mainTab === 'documents'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Documents
                        </button>
                        <button
                            onClick={() => {
                                setMainTab('images');
                                navigate(`/apps/${id}/images`);
                            }}
                            className={`px-6 py-3 font-medium border-b-2 transition flex items-center gap-2 ${mainTab === 'images'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Image className="w-4 h-4" />
                            Images
                            {appImages.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                    {appImages.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* DOCUMENTS TAB */}
                {mainTab === 'documents' && (
                    <>
                        {/* Action Buttons */}
                        {document.status === 'DRAFT' && (
                            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-blue-900 mb-1">Document is in Draft Status</h2>
                                    <p className="text-blue-700 text-sm">You can publish the documents after reviewing them</p>
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
                                    <h2 className="font-semibold text-purple-900">Documents Published! 🎉</h2>
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
                                                {`${window.location.origin}/apps/${normalizeAppName(document.appName)}/delete-request`}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(`${window.location.origin}/apps/${normalizeAppName(document.appName)}/delete-request`, 'delete')}
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
                                                onClick={() => openUrl(`${window.location.origin}/apps/${normalizeAppName(document.appName)}/delete-request`)}
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

                        {document.status === 'DRAFT' && (
                            <div className="mb-8 flex justify-end">
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {deleting ? 'Deleting...' : 'Delete App'}
                                </button>
                            </div>
                        )}

                        {/* Document Sub-tabs */}
                        <div className="mb-6 flex gap-2 border-b border-gray-200 overflow-x-auto">
                            <button
                                onClick={() => setDocumentTab('privacy')}
                                className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${documentTab === 'privacy'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Privacy Policy
                            </button>
                            <button
                                onClick={() => setDocumentTab('terms')}
                                className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${documentTab === 'terms'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Terms of Service
                            </button>
                            {document.deleteRequests && document.deleteRequests.length > 0 && (
                                <button
                                    onClick={() => setDocumentTab('deletions')}
                                    className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${documentTab === 'deletions'
                                        ? 'border-red-600 text-red-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Deletion Requests ({document.deleteRequests.length})
                                </button>
                            )}
                        </div>

                        {/* Document Content */}
                        {documentTab !== 'deletions' && (
                            <div className="bg-white rounded-lg shadow-md p-8">
                                <div className="flex justify-end mb-6">
                                    <button
                                        onClick={() => handleDownload(documentTab === 'privacy' ? 'privacy' : 'terms')}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                                <div className="prose prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                        {documentTab === 'privacy' ? document.privacyPolicy : document.termsOfService}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deletion Requests */}
                        {documentTab === 'deletions' && (
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
                                                                <td className="py-3 px-4 text-gray-900 font-medium break-all">{request.email}</td>
                                                                <td className="py-3 px-4 text-gray-600 text-sm">
                                                                    {requestDate.toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
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
                    </>
                )}

                {/* IMAGES TAB */}
                {mainTab === 'images' && (
                    <>
                        {/* Image Generation Section */}
                        <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <h2 className="font-semibold text-purple-900">Generate Store Assets with AI</h2>
                            </div>
                            <p className="text-purple-700 text-sm mb-6">
                                Use Gemini AI to generate app icons, feature graphics, and store screenshots for your app.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                {/* Image Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Type</label>
                                    <select
                                        value={imageType}
                                        onChange={(e) => {
                                            setImageType(e.target.value);
                                            // Reset transparent background when changing type
                                            if (e.target.value !== 'APP_ICON') {
                                                setTransparentBackground(false);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    >
                                        <option value="APP_ICON">App Icon (1152x1152)</option>
                                        <option value="FEATURE_GRAPHIC">Feature Graphic (1024x500)</option>
                                        <option value="STORE_SCREENSHOT">Store Screenshot (1080x1920)</option>
                                    </select>
                                    {/* Transparent Background Option - Only for App Icons */}
                                    {imageType === 'APP_ICON' && (
                                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={transparentBackground}
                                                onChange={(e) => setTransparentBackground(e.target.checked)}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                            />
                                            <span className="text-sm text-gray-600">Transparent background</span>
                                        </label>
                                    )}
                                </div>

                                {/* Style */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                                    <select
                                        value={imageStyle}
                                        onChange={(e) => setImageStyle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    >
                                        <option value="modern">Modern & Clean</option>
                                        <option value="minimalist">Minimalist</option>
                                        <option value="colorful">Colorful & Vibrant</option>
                                        <option value="professional">Professional</option>
                                        <option value="playful">Playful & Fun</option>
                                        <option value="elegant">Elegant & Luxury</option>
                                    </select>
                                </div>

                                {/* Custom Prompt */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (Optional)</label>
                                    <input
                                        type="text"
                                        value={imagePrompt}
                                        onChange={(e) => setImagePrompt(e.target.value)}
                                        placeholder="E.g., blue color scheme, nature theme..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Reference Images Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {imageType === 'STORE_SCREENSHOT' ? (
                                        <>App Screenshots <span className="text-red-500">*</span> (Required - min 1, max 3)</>
                                    ) : (
                                        <>Reference Images (Optional - max 3)</>
                                    )}
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    {imageType === 'STORE_SCREENSHOT' 
                                        ? 'Upload your app screenshots. The AI will create a beautiful store listing image featuring your app.'
                                        : 'Upload images to use as style reference, background inspiration, or design elements.'}
                                </p>
                                {imageType === 'STORE_SCREENSHOT' && referenceImages.length === 0 && (
                                    <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm text-amber-700">Please upload at least 1 app screenshot to generate a store image.</span>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-3 items-center">
                                    {referenceImages.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Reference ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                            />
                                            <button
                                                onClick={() => removeReferenceImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {referenceImages.length < 3 && (
                                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
                                            <Upload className="w-5 h-5 text-gray-400" />
                                            <span className="text-xs text-gray-400 mt-1">Add</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleReferenceImageUpload}
                                                className="hidden"
                                                multiple
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateImage}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Generate Image
                            </button>
                        </div>

                        {/* Generated Images */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <Image className="w-5 h-5 text-indigo-600" />
                                    Generated Images
                                </h2>
                                <button
                                    onClick={() => refetchImages()}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh
                                </button>
                            </div>

                            {imagesLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                                </div>
                            ) : appImages.length === 0 && generatingCount === 0 ? (
                                <div className="text-center py-12">
                                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Yet</h3>
                                    <p className="text-gray-600">Generate your first image using the form above.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Loading placeholders for generating images */}
                                    {generatingCount > 0 && Array.from({ length: generatingCount }).map((_, index) => (
                                        <div key={`loading-${index}`} className="border border-purple-300 rounded-lg overflow-hidden animate-pulse">
                                            <div className="aspect-square bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center justify-center">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                                    <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                                </div>
                                                <span className="text-sm text-purple-600 font-medium mt-4">AI is creating...</span>
                                                <span className="text-xs text-purple-400 mt-1">This may take a moment</span>
                                            </div>
                                            <div className="p-4 bg-purple-50">
                                                <div className="h-4 bg-purple-200 rounded w-24 mb-2"></div>
                                                <div className="h-3 bg-purple-100 rounded w-full"></div>
                                            </div>
                                        </div>
                                    ))}
                                    {appImages.map((image) => (
                                        <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden group">
                                            <div className="aspect-square bg-gray-100 relative">
                                                <img
                                                    src={image.cloudinaryUrl}
                                                    alt={getImageTypeLabel(image.imageType)}
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleDownloadImage(image.cloudinaryUrl, `${document.appName}-${image.imageType}.png`)}
                                                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                                                        title="Download"
                                                    >
                                                        <Download className="w-5 h-5 text-gray-700" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteImage(image.id)}
                                                        className="p-2 bg-white rounded-lg hover:bg-red-50 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                                        {getImageTypeLabel(image.imageType)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {image.width}x{image.height}
                                                    </span>
                                                </div>
                                                {image.prompt && (
                                                    <p className="text-sm text-gray-600 truncate" title={image.prompt}>
                                                        {image.prompt}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(image.createdAt).toLocaleDateString('en-US')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Edit Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Edit App</h3>
                                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
                                    <input
                                        type="text"
                                        value={editData.appName}
                                        onChange={(e) => setEditData({ ...editData, appName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">App Description (Optional)</label>
                                    <textarea
                                        value={editData.appDescription}
                                        onChange={(e) => setEditData({ ...editData, appDescription: e.target.value })}
                                        rows="2"
                                        placeholder="Brief description of your app for better image generation..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy</label>
                                    <textarea
                                        value={editData.privacyPolicy}
                                        onChange={(e) => setEditData({ ...editData, privacyPolicy: e.target.value })}
                                        rows="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms of Service</label>
                                    <textarea
                                        value={editData.termsOfService}
                                        onChange={(e) => setEditData({ ...editData, termsOfService: e.target.value })}
                                        rows="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
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

export default AppDetailPage;
