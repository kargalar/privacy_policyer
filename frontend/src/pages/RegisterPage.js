import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { REGISTER_MUTATION } from '../graphql/queries';
import { AlertCircle, UserPlus, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION, {
        onCompleted: (data) => {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        },
        onError: (error) => {
            setError(error.message || 'Registration failed');
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!formData.email || !formData.password || !formData.username) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        await registerMutation({
            variables: {
                email: formData.email,
                password: formData.password,
                username: formData.username,
            },
        });
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Registration Successful!
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Your account has been created. Please wait for admin approval.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting to login page...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <UserPlus className="w-12 h-12 text-indigo-600" />
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    Create Account
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Create a new account
                </p>

                {error && (
                    <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="john_doe"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Used in public document URLs
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
