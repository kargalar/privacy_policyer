import React from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GET_PUBLIC_DOCUMENT_QUERY } from '../graphql/queries';

const PublicDocumentPage = () => {
    const { username, appName, type } = useParams();

    const { data, loading, error } = useQuery(GET_PUBLIC_DOCUMENT_QUERY, {
        variables: {
            username,
            appName: appName.replace(/-/g, ' ') // Convert URL format back to normal
        },
        fetchPolicy: 'network-only', // Always fetch from network for public pages
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-600">Yükleniyor...</p>
            </div>
        );
    }

    if (error || !data?.publicDocument) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-600">Doküman bulunamadı.</p>
            </div>
        );
    }

    const document = data.publicDocument;
    const showContent = type === 'termsofservice' ? document.termsOfService : document.privacyPolicy;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-8 py-8">
                <div className="prose prose-slate max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {showContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default PublicDocumentPage;
