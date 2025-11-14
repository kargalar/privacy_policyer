import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
    PENDING_USERS_QUERY,
    APPROVE_USER_MUTATION,
    REJECT_USER_MUTATION,
} from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const AdminPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const { data: usersData, loading: usersLoading, refetch } = useQuery(
        PENDING_USERS_QUERY
    );

    const [approveUser] = useMutation(APPROVE_USER_MUTATION, {
        onCompleted: () => {
            refetch();
        },
        onError: (error) => {
            alert('Hata: ' + error.message);
        },
    });

    const [rejectUser] = useMutation(REJECT_USER_MUTATION, {
        onCompleted: () => {
            refetch();
        },
        onError: (error) => {
            alert('Hata: ' + error.message);
        },
    });

    if (!isAuthenticated || !user?.isAdmin) {
        navigate('/dashboard');
        return null;
    }

    const handleApprove = async (userId) => {
        if (window.confirm('Bu kullanıcıyı onaylamak istediğinizden emin misiniz?')) {
            await approveUser({
                variables: { userId },
            });
        }
    };

    const handleReject = async (userId) => {
        if (window.confirm('Bu kullanıcıyı reddetmek istediğinizden emin misiniz?')) {
            await rejectUser({
                variables: { userId },
            });
        }
    };

    const pendingUsers = usersData?.pendingUsers || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Admin Paneli
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Yeni kullanıcıları onaylayın veya reddedin
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {usersLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : pendingUsers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Onay Bekleyen Kullanıcı Yok
                        </h2>
                        <p className="text-gray-600">
                            Tüm kullanıcılar onaylanmış veya reddetilmiştir.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Ad Soyad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            E-posta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Kayıt Tarihi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pendingUsers.map((pendingUser) => (
                                        <tr key={pendingUser.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {pendingUser.fullName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {pendingUser.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(pendingUser.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                <button
                                                    onClick={() => handleApprove(pendingUser.id)}
                                                    className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Onayla
                                                </button>
                                                <button
                                                    onClick={() => handleReject(pendingUser.id)}
                                                    className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reddet
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">{pendingUsers.length}</span> kullanıcı
                                onay bekliyordu
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
