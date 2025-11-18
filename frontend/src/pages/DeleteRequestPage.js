import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { CREATE_DELETE_REQUEST_MUTATION } from '../graphql/queries';
import {
    CheckCircle,
    AlertCircle,
    Mail,
} from 'lucide-react';

const DeleteRequestPage = () => {
    const { id } = useParams();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const [createDeleteRequest, { loading }] = useMutation(
        CREATE_DELETE_REQUEST_MUTATION,
        {
            onCompleted: () => {
                setSubmitted(true);
                setEmail('');
                setError(null);
            },
            onError: (error) => {
                setError(error.message || 'An error occurred while submitting your request');
            },
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        createDeleteRequest({
            variables: {
                documentId: id,
                email: email.trim(),
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-12">
                {submitted ? (
                    // Success Message
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                            Account Deletion Request
                        </h1>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Request Submitted Successfully
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your account deletion request has been received. We will process your request
                            according to our data retention and privacy policies.
                        </p>
                        <p className="text-sm text-gray-500">
                            A confirmation email will be sent to: <span className="font-semibold">{email}</span>
                        </p>
                    </div>
                ) : (
                    // Form
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                            Account Deletion Request
                        </h1>
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                <p className="text-sm text-orange-800">
                                    This is a formal request to delete your account associated with this application.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </div>
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Enter the email address associated with your account for this deletion request.
                                </p>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="your.email@example.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <h3 className="font-semibold text-gray-900 text-sm">Important Information:</h3>
                                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                                    <li>Your deletion request will be recorded and processed</li>
                                    <li>You will receive a confirmation email at the provided address</li>
                                    <li>Please allow 30 days for the deletion process to complete</li>
                                    <li>Some data may be retained for legal compliance purposes</li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Deletion Request'}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DeleteRequestPage;
