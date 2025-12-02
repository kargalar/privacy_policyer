import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
    CREATE_APP_MUTATION,
    GET_MY_DOCUMENTS_QUERY,
} from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader, LogOut, ArrowLeft, Smartphone } from 'lucide-react';

const CreatePage = () => {
    const [appName, setAppName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const [createApp, { loading: creating }] = useMutation(
        CREATE_APP_MUTATION,
        {
            onCompleted: (data) => {
                console.log('✓ App created:', data);
                // Redirect to app detail page (documents tab)
                navigate(`/apps/${data.createApp.id}/documents`);
            },
            onError: (error) => {
                console.error('✗ Error creating app:', error);
                setError(error.message || 'Failed to create app');
            },
            refetchQueries: [{ query: GET_MY_DOCUMENTS_QUERY }],
        }
    );

    if (!isAuthenticated || (user?.status !== 'APPROVED' && user?.status !== 'ADMIN')) {
        navigate('/apps');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!appName.trim()) {
            setError('Please enter an app name');
            return;
        }

        await createApp({
            variables: {
                appName: appName.trim(),
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/apps')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Apps
                    </button>
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
                        Create New App
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Enter your app name to get started
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
                    {/* App Name Input */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-900">
                                    App Name <span className="text-red-600">*</span>
                                </label>
                                <p className="text-gray-600 text-sm">
                                    Enter the name of your application
                                </p>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="My Awesome App"
                            autoFocus
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                            <strong>Next steps:</strong> After creating your app, you'll be redirected to the app management page where you can generate privacy policies, terms of service, and other documents.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <button
                            type="submit"
                            disabled={creating || !appName.trim()}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {creating && <Loader className="w-4 h-4 animate-spin" />}
                            {creating ? 'Creating App...' : 'Create App'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreatePage;
