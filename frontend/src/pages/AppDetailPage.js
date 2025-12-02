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
    GET_DOCUMENT_USAGE,
    GENERATE_APP_DESCRIPTION_MUTATION,
    GENERATE_DOCUMENTS_FOR_APP_MUTATION,
} from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import { questions as staticQuestions, getQuestionsBySection } from '../data/questions';
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
    FileText,
    Image,
    Smartphone,
    Sparkles,
    RefreshCw,
    Upload,
    DollarSign,
    TrendingUp,
    Calendar,
    Plus,
    Type,
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

// Image count options
const IMAGE_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6];

// Color options for image generation
const COLOR_OPTIONS = [
    { id: 'colorful', name: 'Colorful', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'], emoji: '🌈' },
    { id: 'red', name: 'Red', colors: ['#E74C3C', '#C0392B'], emoji: '❤️' },
    { id: 'orange', name: 'Orange', colors: ['#E67E22', '#D35400'], emoji: '🧡' },
    { id: 'yellow', name: 'Yellow', colors: ['#F1C40F', '#F39C12'], emoji: '💛' },
    { id: 'green', name: 'Green', colors: ['#2ECC71', '#27AE60'], emoji: '💚' },
    { id: 'blue', name: 'Blue', colors: ['#3498DB', '#2980B9'], emoji: '💙' },
    { id: 'purple', name: 'Purple', colors: ['#9B59B6', '#8E44AD'], emoji: '💜' },
    { id: 'pink', name: 'Pink', colors: ['#E91E63', '#C2185B'], emoji: '💗' },
    { id: 'black', name: 'Black', colors: ['#2C3E50', '#1A252F'], emoji: '🖤' },
    { id: 'white', name: 'White', colors: ['#ECF0F1', '#BDC3C7'], emoji: '🤍' },
    { id: 'gold', name: 'Gold', colors: ['#FFD700', '#DAA520'], emoji: '✨' },
    { id: 'silver', name: 'Silver', colors: ['#C0C0C0', '#A8A8A8'], emoji: '🩶' },
];

const AppDetailPage = () => {
    const { id, tab: urlTab } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
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
    const [selectedStyles, setSelectedStyles] = useState(['origami']); // Multiple styles can be selected
    const [selectedColors, setSelectedColors] = useState([]); // Multiple colors can be selected
    const [imagePrompt, setImagePrompt] = useState('');
    const [requiredText, setRequiredText] = useState(''); // Text that must appear in the image
    const [onlyRequiredText, setOnlyRequiredText] = useState(false); // Only include required text, no other text
    const [referenceImages, setReferenceImages] = useState([]);
    const [generatingCount, setGeneratingCount] = useState(0); // Track number of images being generated
    const [transparentBackground, setTransparentBackground] = useState(false); // For app icons
    const [includeText, setIncludeText] = useState(false); // Include text in generated images
    const [includeAppName, setIncludeAppName] = useState(true); // Include app name in feature graphics
    const [lightboxImage, setLightboxImage] = useState(null); // For viewing images in lightbox
    const [isDragging, setIsDragging] = useState(false); // For drag and drop
    const [imageFilter, setImageFilter] = useState('ALL'); // Filter for generated images: ALL, APP_ICON, FEATURE_GRAPHIC, STORE_SCREENSHOT
    // Description generation state
    const [descriptionPrompt, setDescriptionPrompt] = useState('');
    const [generatedShortDesc, setGeneratedShortDesc] = useState('');
    const [generatedLongDesc, setGeneratedLongDesc] = useState('');
    const [imageCount, setImageCount] = useState(1); // Number of images to generate
    // Document creation state
    const [showDocumentForm, setShowDocumentForm] = useState(false);
    const [documentAnswers, setDocumentAnswers] = useState({});
    const [documentError, setDocumentError] = useState('');

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

    const { data: usageData, loading: usageLoading, refetch: refetchUsage } = useQuery(GET_DOCUMENT_USAGE, {
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
        if (urlTab && ['documents', 'description', 'images', 'usage'].includes(urlTab)) {
            setMainTab(urlTab);
        }
    }, [urlTab]);

    // Load saved descriptions from database
    useEffect(() => {
        if (documentData?.document?.shortDescription && !generatedShortDesc) {
            setGeneratedShortDesc(documentData.document.shortDescription);
        }
        if (documentData?.document?.longDescription && !generatedLongDesc) {
            setGeneratedLongDesc(documentData.document.longDescription);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentData]);

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

    const [generateDocumentsForAppMutation, { loading: generatingDocuments }] = useMutation(GENERATE_DOCUMENTS_FOR_APP_MUTATION, {
        onCompleted: () => {
            setShowDocumentForm(false);
            setDocumentAnswers({});
            setDocumentError('');
            refetch();
        },
        onError: (error) => {
            setDocumentError(error.message || 'Failed to generate documents');
        },
    });

    const [generateAppImageMutation] = useMutation(GENERATE_APP_IMAGE_MUTATION, {
        onCompleted: (data) => {
            // data.generateAppImage is now an array
            const generatedImages = data?.generateAppImage || [];
            setGeneratingCount(prev => Math.max(0, prev - generatedImages.length));
            refetchImages();
            // No alert - silently complete
        },
        onError: (error) => {
            setGeneratingCount(prev => Math.max(0, prev - imageCount));
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

    const [generateDescriptionMutation, { loading: generatingDescription }] = useMutation(GENERATE_APP_DESCRIPTION_MUTATION, {
        onCompleted: (data) => {
            setGeneratedShortDesc(data.generateAppDescription.shortDescription);
            setGeneratedLongDesc(data.generateAppDescription.longDescription);
        },
        onError: (error) => {
            alert('Error generating description: ' + error.message);
        },
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

    const handleDocumentAnswerChange = (questionId, value) => {
        setDocumentAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleGenerateDocuments = async () => {
        setDocumentError('');

        // Find first unanswered required question from visible questions only
        const visibleQuestions = Object.values(getQuestionsBySection(documentAnswers)).flat();
        const firstUnanswered = visibleQuestions.find(
            (q) => q.required && (documentAnswers[q.id] === undefined || documentAnswers[q.id] === null || documentAnswers[q.id] === '')
        );

        if (firstUnanswered) {
            setDocumentError(`Please answer: "${firstUnanswered.question}"`);
            // Scroll to the first unanswered question
            const element = document.getElementById(`question-${firstUnanswered.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add focus to the input if possible
                const input = element.querySelector('input, textarea, select');
                if (input) {
                    setTimeout(() => input.focus(), 500);
                }
            }
            return;
        }

        const answerInputs = staticQuestions
            .filter((q) => documentAnswers[q.id])
            .map((q) => ({
                questionId: q.id,
                value: documentAnswers[q.id].toString(),
            }));

        await generateDocumentsForAppMutation({
            variables: {
                documentId: id,
                answers: answerInputs,
            },
        });
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
        // Check if description is generated
        if (!generatedShortDesc || !generatedLongDesc) {
            alert('Please generate app description first. Go to Description tab to create your app description.');
            return;
        }

        // Check if at least one style is selected
        if (selectedStyles.length === 0) {
            alert('Please select at least one style.');
            return;
        }

        // Store Screenshot requires at least 1 reference image (app screenshot)
        if (imageType === 'STORE_SCREENSHOT' && referenceImages.length === 0) {
            alert('Store Screenshot requires at least 1 app screenshot. Please upload your app screenshot first.');
            return;
        }

        // Calculate total images: styles × count
        const totalImages = selectedStyles.length * imageCount;
        setGeneratingCount(prev => prev + totalImages);

        // Generate images for all selected styles in one request
        generateAppImageMutation({
            variables: {
                documentId: id,
                imageType,
                styles: selectedStyles,
                colors: selectedColors.length > 0 ? selectedColors : null,
                prompt: imagePrompt,
                requiredText: requiredText.trim() || null,
                onlyRequiredText: onlyRequiredText,
                referenceImages: referenceImages.length > 0 ? referenceImages : null,
                transparentBackground: imageType === 'APP_ICON' ? transparentBackground : false,
                count: imageCount,
                includeText: includeText,
                includeAppName: imageType === 'FEATURE_GRAPHIC' ? includeAppName : false,
            },
        });

        // Clear only references after starting generation, keep prompt
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

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length === 0) return;

        const maxImages = 3;
        const maxSizePerImage = 5 * 1024 * 1024;

        for (const file of files.slice(0, maxImages - referenceImages.length)) {
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
            {/* Page Title */}
            <title>{document.appName} - App Manager</title>

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
                            className={`px-6 py-4 font-medium border-b-2 transition flex items-center gap-2 ${mainTab === 'documents'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Documents
                        </button>
                        <button
                            onClick={() => {
                                setMainTab('description');
                                navigate(`/apps/${id}/description`);
                            }}
                            className={`px-6 py-4 font-medium border-b-2 transition flex items-center gap-2 ${mainTab === 'description'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Type className="w-4 h-4" />
                            Description
                            {generatedShortDesc && (
                                <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                    ✓
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setMainTab('images');
                                navigate(`/apps/${id}/images`);
                            }}
                            className={`px-6 py-4 font-medium border-b-2 transition flex items-center gap-2 ${mainTab === 'images'
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
                        <button
                            onClick={() => {
                                setMainTab('usage');
                                navigate(`/apps/${id}/usage`);
                            }}
                            className={`px-6 py-4 font-medium border-b-2 transition flex items-center gap-2 ${mainTab === 'usage'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <DollarSign className="w-4 h-4" />
                            Usage
                            {usageData?.documentUsage?.totalCost > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                    ${usageData.documentUsage.totalCost.toFixed(2)}
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
                        {/* Show Create Document button - always visible */}
                        {!showDocumentForm && (
                            <div className="mb-8 flex justify-end">
                                <button
                                    onClick={() => setShowDocumentForm(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create New Document
                                </button>
                            </div>
                        )}

                        {/* Document Creation Form */}
                        {showDocumentForm && (
                            <div className="mb-8 bg-white border border-gray-200 rounded-lg shadow-md">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900">Create New Document</h2>
                                        <button
                                            onClick={() => {
                                                setShowDocumentForm(false);
                                                setDocumentAnswers({});
                                                setDocumentError('');
                                            }}
                                            className="p-2 text-gray-500 hover:text-gray-700 transition"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-gray-600 mt-1">Answer the questions below to generate your documents</p>
                                </div>

                                <div className="p-6">
                                    {documentError && (
                                        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            <span className="text-red-700">{documentError}</span>
                                        </div>
                                    )}

                                    {/* Progress Indicator */}
                                    <div className="mb-6">
                                        {(() => {
                                            const sections = getQuestionsBySection(documentAnswers);
                                            const totalVisible = Object.values(sections).flat().length;
                                            const answered = Object.keys(documentAnswers).filter(k => documentAnswers[k] !== '').length;
                                            return (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="font-medium">{answered}/{totalVisible} questions answered</span>
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${totalVisible > 0 ? (answered / totalVisible) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Questions by Section */}
                                    <div className="space-y-8">
                                        {Object.entries(getQuestionsBySection(documentAnswers)).map(([sectionName, sectionQuestions]) => (
                                            <div key={sectionName} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                    <h3 className="font-semibold text-gray-800">{sectionName}</h3>
                                                </div>
                                                <div className="p-4 space-y-6">
                                                    {sectionQuestions.map((question) => (
                                                        <div key={question.id} id={`question-${question.id}`} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                                            <label className="block text-base font-medium text-gray-900 mb-2">
                                                                {question.question}
                                                                {question.required && <span className="text-red-600 ml-1">*</span>}
                                                            </label>

                                                            {question.description && (
                                                                <p className="text-gray-600 text-sm mb-3">
                                                                    {question.description}
                                                                </p>
                                                            )}

                                                            {question.type === 'TEXT' && (
                                                                <input
                                                                    type="text"
                                                                    value={documentAnswers[question.id] || ''}
                                                                    onChange={(e) => handleDocumentAnswerChange(question.id, e.target.value)}
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="Enter your answer..."
                                                                />
                                                            )}

                                                            {question.type === 'EMAIL' && (
                                                                <input
                                                                    type="email"
                                                                    value={documentAnswers[question.id] || ''}
                                                                    onChange={(e) => handleDocumentAnswerChange(question.id, e.target.value)}
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="email@example.com"
                                                                />
                                                            )}

                                                            {question.type === 'TEXTAREA' && (
                                                                <textarea
                                                                    value={documentAnswers[question.id] || ''}
                                                                    onChange={(e) => handleDocumentAnswerChange(question.id, e.target.value)}
                                                                    rows="3"
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="Enter your detailed answer..."
                                                                />
                                                            )}

                                                            {question.type === 'SELECT' && (
                                                                <select
                                                                    value={documentAnswers[question.id] || ''}
                                                                    onChange={(e) => handleDocumentAnswerChange(question.id, e.target.value)}
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                                                >
                                                                    <option value="">Select an option...</option>
                                                                    {question.options?.map((option) => (
                                                                        <option key={option} value={option}>
                                                                            {option}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            )}

                                                            {question.type === 'BOOLEAN' && (
                                                                <div className="flex gap-4">
                                                                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition ${documentAnswers[question.id] === 'true' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name={question.id}
                                                                            value="true"
                                                                            checked={documentAnswers[question.id] === 'true'}
                                                                            onChange={(e) => handleDocumentAnswerChange(question.id, e.target.value)}
                                                                            className="sr-only"
                                                                        />
                                                                        <Check className={`w-4 h-4 ${documentAnswers[question.id] === 'true' ? 'text-green-600' : 'text-gray-400'}`} />
                                                                        <span className="font-medium">Yes</span>
                                                                    </label>
                                                                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition ${documentAnswers[question.id] === 'false' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name={question.id}
                                                                            value="false"
                                                                            checked={documentAnswers[question.id] === 'false'}
                                                                            onChange={(e) => handleDocumentAnswerChange(question.id, e.target.value)}
                                                                            className="sr-only"
                                                                        />
                                                                        <X className={`w-4 h-4 ${documentAnswers[question.id] === 'false' ? 'text-red-600' : 'text-gray-400'}`} />
                                                                        <span className="font-medium">No</span>
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handleGenerateDocuments}
                                            disabled={generatingDocuments}
                                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {generatingDocuments && <Loader className="w-4 h-4 animate-spin" />}
                                            {generatingDocuments ? 'Generating Documents...' : 'Generate Documents'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons - Only show when documents exist */}
                        {document.privacyPolicy && document.status === 'DRAFT' && (
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

                        {document.privacyPolicy && document.status === 'PUBLISHED' && (
                            <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Globe className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-purple-900">Public URLs</h3>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Published</span>
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

                        {/* Delete button for non-published documents */}
                        {document.status !== 'PUBLISHED' && (
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

                        {/* Document Sub-tabs - Only show when documents exist */}
                        {document.privacyPolicy && (
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
                        )}

                        {/* Document Content - Only show when documents exist */}
                        {document.privacyPolicy && documentTab !== 'deletions' && (
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

                        {/* Deletion Requests - Only show when documents exist */}
                        {document.privacyPolicy && documentTab === 'deletions' && (
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

                            {/* Image Type & Additional Details Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

                                {/* Custom Prompt */}
                                <div>
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

                            {/* Style Selection Grid - Multiple Selection */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select Styles <span className="text-gray-400">(multiple allowed)</span>
                                    </label>
                                    {selectedStyles.length > 0 && (
                                        <span className="text-xs text-purple-600 font-medium">
                                            {selectedStyles.length} selected
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-3">
                                    {STYLE_OPTIONS.map((style) => {
                                        const isSelected = selectedStyles.includes(style.id);
                                        return (
                                            <button
                                                key={style.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        // Remove if already selected (but keep at least one)
                                                        if (selectedStyles.length > 1) {
                                                            setSelectedStyles(prev => prev.filter(s => s !== style.id));
                                                        }
                                                    } else {
                                                        // Add to selection
                                                        setSelectedStyles(prev => [...prev, style.id]);
                                                    }
                                                }}
                                                className={`relative group flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isSelected
                                                    ? 'ring-2 ring-pink-500 ring-offset-2 bg-white shadow-lg scale-105'
                                                    : 'bg-white hover:shadow-md hover:scale-102 border border-gray-200'
                                                    }`}
                                            >
                                                {/* Style Preview */}
                                                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${style.color} flex items-center justify-center text-2xl mb-1.5 shadow-sm`}>
                                                    {style.emoji}
                                                </div>
                                                {/* Style Name */}
                                                <span className={`text-xs font-medium ${isSelected ? 'text-pink-600' : 'text-gray-700'
                                                    }`}>
                                                    {style.name}
                                                </span>
                                                {/* Selection Indicator */}
                                                {isSelected && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Color Selection Grid - Multiple Selection */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select Colors <span className="text-gray-400">(optional)</span>
                                    </label>
                                    {selectedColors.length > 0 && (
                                        <button
                                            onClick={() => setSelectedColors([])}
                                            className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_OPTIONS.map((color) => {
                                        const isSelected = selectedColors.includes(color.id);
                                        return (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedColors(prev => prev.filter(c => c !== color.id));
                                                    } else {
                                                        setSelectedColors(prev => [...prev, color.id]);
                                                    }
                                                }}
                                                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isSelected
                                                    ? 'ring-2 ring-purple-500 ring-offset-1 bg-white shadow-md'
                                                    : 'bg-white hover:shadow-sm border border-gray-200'
                                                    }`}
                                            >
                                                {/* Color Preview */}
                                                <div className="flex -space-x-1">
                                                    {color.colors.slice(0, 3).map((c, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-medium text-gray-700">{color.emoji} {color.name}</span>
                                                {isSelected && (
                                                    <Check className="w-3 h-3 text-purple-600" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Required Text Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Required Text <span className="text-gray-400">(text that must appear in the image)</span>
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={requiredText}
                                        onChange={(e) => setRequiredText(e.target.value)}
                                        placeholder="e.g., Download Now, 50% OFF, New Features..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                {requiredText.trim() && (
                                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                                        <input
                                            type="checkbox"
                                            checked={onlyRequiredText}
                                            onChange={(e) => setOnlyRequiredText(e.target.checked)}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">Only include this text (no app name or other text)</span>
                                    </label>
                                )}
                            </div>

                            {/* Image Options */}
                            <div className="mb-6 flex flex-wrap gap-6">
                                {/* Include Text Toggle */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeText}
                                        onChange={(e) => setIncludeText(e.target.checked)}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">Include text in image</span>
                                </label>

                                {/* Include App Name Toggle (Feature Graphic only) */}
                                {imageType === 'FEATURE_GRAPHIC' && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={includeAppName}
                                            onChange={(e) => setIncludeAppName(e.target.checked)}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">Include app name</span>
                                    </label>
                                )}
                            </div>

                            {/* Reference Images Upload with Drag & Drop */}
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
                                        : 'Upload images to use as style reference, background inspiration, or design elements. Drag & drop or click to upload.'}
                                </p>
                                {imageType === 'STORE_SCREENSHOT' && referenceImages.length === 0 && (
                                    <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm text-amber-700">Please upload at least 1 app screenshot to generate a store image.</span>
                                    </div>
                                )}
                                <div
                                    className={`flex flex-wrap gap-3 items-center p-4 rounded-lg border-2 border-dashed transition ${isDragging
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-300 bg-gray-50'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {referenceImages.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Reference ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                            />
                                            <button
                                                onClick={() => removeReferenceImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {referenceImages.length < 3 && (
                                        <label className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-100 transition bg-white">
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
                                    {referenceImages.length === 0 && (
                                        <span className="text-sm text-gray-500 ml-2">
                                            {isDragging ? 'Drop images here...' : 'Drag & drop images here or click the + button'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Generate Button with Count Selection */}
                            <div className="flex items-center gap-4">
                                {/* Image Count Selection */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Per style:</span>
                                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                        {IMAGE_COUNT_OPTIONS.map((count) => (
                                            <button
                                                key={count}
                                                type="button"
                                                onClick={() => setImageCount(count)}
                                                className={`px-4 py-2 text-sm font-medium transition ${imageCount === count
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                                    } ${count !== IMAGE_COUNT_OPTIONS[IMAGE_COUNT_OPTIONS.length - 1] ? 'border-r border-gray-300' : ''}`}
                                            >
                                                {count}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerateImage}
                                    disabled={selectedStyles.length === 0}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Generate {selectedStyles.length * imageCount} Image{selectedStyles.length * imageCount > 1 ? 's' : ''}
                                </button>
                            </div>

                            {/* Cost estimate */}
                            <p className="text-xs text-gray-400 mt-2">
                                {selectedStyles.length} style{selectedStyles.length > 1 ? 's' : ''} × {imageCount} image{imageCount > 1 ? 's' : ''} = {selectedStyles.length * imageCount} total |
                                Estimated cost: ~${(selectedStyles.length * imageCount * 0.02).toFixed(2)} USD
                            </p>
                        </div>

                        {/* Generated Images */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
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

                            {/* Image Type Filter */}
                            <div className="flex gap-2 mb-6">
                                {[
                                    { id: 'ALL', label: 'All', count: appImages.length },
                                    { id: 'APP_ICON', label: 'Icons', count: appImages.filter(i => i.imageType === 'APP_ICON').length },
                                    { id: 'FEATURE_GRAPHIC', label: 'Feature', count: appImages.filter(i => i.imageType === 'FEATURE_GRAPHIC').length },
                                    { id: 'STORE_SCREENSHOT', label: 'Screenshots', count: appImages.filter(i => i.imageType === 'STORE_SCREENSHOT').length },
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setImageFilter(filter.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${imageFilter === filter.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {filter.label}
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${imageFilter === filter.id
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {filter.count}
                                        </span>
                                    </button>
                                ))}
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
                                    {appImages
                                        .filter(image => imageFilter === 'ALL' || image.imageType === imageFilter)
                                        .map((image) => (
                                            <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden relative">
                                                {/* Action buttons - always visible, top right */}
                                                <div className="absolute top-2 right-2 z-10 flex gap-1">
                                                    <button
                                                        onClick={() => handleDownloadImage(image.cloudinaryUrl, `${document.appName}-${image.imageType}.png`)}
                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white shadow-sm transition"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4 text-gray-700" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteImage(image.id)}
                                                        className="p-2 bg-white/90 rounded-lg hover:bg-red-50 shadow-sm transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>

                                                {/* Clickable image area */}
                                                <div
                                                    className="aspect-square bg-gray-100 cursor-pointer"
                                                    onClick={() => setLightboxImage(image.cloudinaryUrl)}
                                                >
                                                    <img
                                                        src={image.cloudinaryUrl}
                                                        alt={getImageTypeLabel(image.imageType)}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                                                {getImageTypeLabel(image.imageType)}
                                                            </span>
                                                            {image.style && (
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium capitalize">
                                                                    {image.style}
                                                                </span>
                                                            )}
                                                        </div>
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

                {/* DESCRIPTION TAB */}
                {mainTab === 'description' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Type className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Generate App Store Descriptions</h2>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">
                            Generate compelling app store descriptions with AI. Get a short tagline (80 chars) and a full description (~2000 chars).
                            <span className="block mt-2 text-indigo-600 font-medium">
                                ⚡ Required before generating images
                            </span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Describe your app features and target audience
                                </label>
                                <textarea
                                    value={descriptionPrompt}
                                    onChange={(e) => setDescriptionPrompt(e.target.value)}
                                    placeholder="E.g., A fitness tracking app for beginners with step counting, workout videos, and meal planning. Target users who want to start a healthy lifestyle..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            <button
                                onClick={() => generateDescriptionMutation({
                                    variables: { documentId: id, prompt: descriptionPrompt || document.appName }
                                })}
                                disabled={generatingDescription}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generatingDescription ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Generate Descriptions
                                    </>
                                )}
                            </button>

                            {/* Generated Descriptions */}
                            {(generatedShortDesc || generatedLongDesc) && (
                                <div className="mt-6 space-y-4">
                                    {/* Short Description */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Short Description <span className="text-gray-400">(max 80 chars)</span>
                                            </label>
                                            <span className={`text-xs ${generatedShortDesc.length > 80 ? 'text-red-500' : 'text-gray-500'}`}>
                                                {generatedShortDesc.length}/80
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={generatedShortDesc}
                                                onChange={(e) => setGeneratedShortDesc(e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                maxLength={80}
                                            />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedShortDesc);
                                                    alert('Short description copied!');
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                                title="Copy"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Long Description */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Long Description <span className="text-gray-400">(~2000 chars)</span>
                                            </label>
                                            <span className={`text-xs ${generatedLongDesc.length > 4000 ? 'text-red-500' : 'text-gray-500'}`}>
                                                {generatedLongDesc.length}/4000
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                value={generatedLongDesc}
                                                onChange={(e) => setGeneratedLongDesc(e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                                rows={10}
                                                maxLength={4000}
                                            />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedLongDesc);
                                                    alert('Long description copied!');
                                                }}
                                                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                                                title="Copy"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Success message */}
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 text-sm flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Descriptions generated! You can now go to Images tab to generate store assets.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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

                {/* USAGE TAB */}
                {mainTab === 'usage' && (
                    <div className="space-y-6">
                        {/* Usage Summary */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    API Usage Summary
                                </h2>
                                <button
                                    onClick={() => refetchUsage()}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh
                                </button>
                            </div>

                            {usageLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                                </div>
                            ) : usageData?.documentUsage ? (
                                <>
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-green-500 rounded-lg">
                                                    <DollarSign className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-green-700 font-medium">Total Cost</span>
                                            </div>
                                            <p className="text-3xl font-bold text-green-800">
                                                ${usageData.documentUsage.totalCost.toFixed(4)}
                                            </p>
                                            <p className="text-sm text-green-600 mt-1">USD</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-500 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-blue-700 font-medium">Total Requests</span>
                                            </div>
                                            <p className="text-3xl font-bold text-blue-800">
                                                {usageData.documentUsage.totalRequests}
                                            </p>
                                            <p className="text-sm text-blue-600 mt-1">API calls</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-purple-500 rounded-lg">
                                                    <Sparkles className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-purple-700 font-medium">Avg Cost/Request</span>
                                            </div>
                                            <p className="text-3xl font-bold text-purple-800">
                                                ${usageData.documentUsage.totalRequests > 0
                                                    ? (usageData.documentUsage.totalCost / usageData.documentUsage.totalRequests).toFixed(4)
                                                    : '0.0000'}
                                            </p>
                                            <p className="text-sm text-purple-600 mt-1">USD per request</p>
                                        </div>
                                    </div>

                                    {/* Usage History */}
                                    {usageData.documentUsage.history.length > 0 ? (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-gray-600" />
                                                Usage History
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Type</th>
                                                            <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Model</th>
                                                            <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Tokens</th>
                                                            <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Cost</th>
                                                            <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {usageData.documentUsage.history.map((item, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="py-3 px-4">
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.usageType === 'IMAGE_GENERATION'
                                                                        ? 'bg-purple-100 text-purple-700'
                                                                        : 'bg-blue-100 text-blue-700'
                                                                        }`}>
                                                                        {item.usageType === 'IMAGE_GENERATION' ? 'Image' : 'Document'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-600 text-sm font-mono">
                                                                    {item.modelName}
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-600 text-sm">
                                                                    {item.inputTokens || 0} in / {item.outputTokens || 0} out
                                                                </td>
                                                                <td className="py-3 px-4 text-green-600 font-medium">
                                                                    ${item.cost.toFixed(4)}
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-500 text-sm">
                                                                    {new Date(item.createdAt).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">No API usage recorded yet</p>
                                            <p className="text-sm text-gray-400 mt-1">Generate documents or images to see usage stats</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Usage Data</h3>
                                    <p className="text-gray-600">Start generating documents or images to track API usage.</p>
                                </div>
                            )}
                        </div>

                        {/* Pricing Info */}
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
                            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Pricing Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-white/50 rounded-lg p-4">
                                    <p className="font-medium text-amber-800 mb-2">Document Generation</p>
                                    <p className="text-amber-700">Model: gemini-2.5-flash</p>
                                    <p className="text-amber-600">~$0.001 per document</p>
                                </div>
                                <div className="bg-white/50 rounded-lg p-4">
                                    <p className="font-medium text-amber-800 mb-2">Image Generation</p>
                                    <p className="text-amber-700">Model: gemini-3-pro-image-preview</p>
                                    <p className="text-amber-600">~$0.02 per image</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Image Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Full size preview"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default AppDetailPage;
