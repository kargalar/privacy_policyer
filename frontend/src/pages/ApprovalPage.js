import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
    PENDING_USERS_QUERY,
    APPROVE_USER_MUTATION,
    REJECT_USER_MUTATION,
} from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import {
    Loader,
    ArrowLeft,
    LogOut,
    CheckCircle,
    XCircle,
} from 'lucide-react';

const ApprovalPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const { data: usersData, loading, refetch } = useQuery(PENDING_USERS_QUERY, {
        skip: !isAuthenticated,
    });

    const [approveMutation, { loading: approving }] = useMutation(
        APPROVE_USER_MUTATION,
        {
            onCompleted: () => {
                refetch();
            },
            onError: (error) => {
                console.error('Error approving user:', error);
                alert('Error approving user');
            },
        }
    );

    const [rejectMutation, { loading: rejecting }] = useMutation(
        REJECT_USER_MUTATION,
        {
            onCompleted: () => {
                refetch();
            },
            onError: (error) => {
                console.error('Error rejecting user:', error);
                alert('Error rejecting user');
            },
        }
    );

    if (!isAuthenticated || user?.status !== 'ADMIN') {
        navigate('/apps');
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const pendingUsers = usersData?.pendingUsers || [];

    const handleApprove = (userId) => {
        approveMutation({
            variables: { userId },
        });
    };

    const handleReject = (userId) => {
        rejectMutation({
            variables: { userId },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="text-gray-600 text-sm">Admin - User Approvals</div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Administrator</p>
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
                    <div className="flex items-center gap-4 mb-2">
                        <button
                            onClick={() => navigate('/apps')}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        User Approvals
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage pending users
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {pendingUsers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            All Users Approved
                        </h2>
                        <p className="text-gray-600">
                            No pending users at the moment
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Registration Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pendingUsers.map((pendingUser) => (
                                    <tr key={pendingUser.id} className="bg-white hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            @{pendingUser.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {pendingUser.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(pendingUser.createdAt).toLocaleDateString('en-US')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(pendingUser.id)}
                                                    disabled={approving}
                                                    className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                                >
                                                    {approving ? (
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(pendingUser.id)}
                                                    disabled={rejecting}
                                                    className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                                >
                                                    {rejecting ? (
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ApprovalPage;
