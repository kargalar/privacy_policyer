import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_PUBLIC_DOCUMENT_QUERY } from '../graphql/queries';
import { AlertCircle, Loader, Download, FileText } from 'lucide-react';

const PublicDocumentPage = () => {
    const { username, appName, type } = useParams();
    const [activeTab, setActiveTab] = useState(type === 'termsofservice' ? 'terms' : 'privacy');

    const { data, loading, error } = useQuery(GET_PUBLIC_DOCUMENT_QUERY, {
        variables: {
            username,
            appName: appName.replace(/-/g, ' ') // Convert URL format back to normal
        },
        fetchPolicy: 'network-only', // Always fetch from network for public pages
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Doküman Yükleniyor
                    </h2>
                    <p className="text-gray-600">
                        Lütfen bekleyin...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !data?.publicDocument) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Doküman Bulunamadı</h1>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Doküman Bulunamadı
                        </h2>
                        <p className="text-gray-600">
                            Bu doküman bulunamadı veya henüz yayınlanmadı.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    const document = data.publicDocument;

    const handleDownload = (downloadType) => {
        const content = downloadType === 'privacy' ? document.privacyPolicy : document.termsOfService;
        const fileName = downloadType === 'privacy' ? 'privacy-policy' : 'terms-of-service';

        const element = window.document.createElement('a');
        const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = `${document.appName}-${fileName}.txt`;
        window.document.body.appendChild(element);
        element.click();
        window.document.body.removeChild(element);
    };

    // Determine which content to show based on URL type parameter
    const showContent = type === 'termsofservice' ? document.termsOfService : document.privacyPolicy;
    const contentTitle = type === 'termsofservice' ? 'Terms of Service' : 'Privacy Policy';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {document.appName}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {contentTitle} - @{username}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Tab Navigation - show only if accessed from root public URL */}
                {!type && (
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
                )}

                {/* Document Content */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{contentTitle}</h2>
                        <button
                            onClick={() => handleDownload(type === 'termsofservice' ? 'terms' : 'privacy')}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Download className="w-4 h-4" />
                            İndir
                        </button>
                    </div>

                    <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {type ? showContent : (activeTab === 'privacy' ? document.privacyPolicy : document.termsOfService)}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Bu doküman {new Date(document.createdAt).toLocaleDateString('tr-TR')} tarihinde oluşturulmuştur.</p>
                    <p className="mt-2">© {new Date().getFullYear()} {document.appName}. Tüm hakları saklıdır.</p>
                </div>
            </main>
        </div>
    );
};

export default PublicDocumentPage;
