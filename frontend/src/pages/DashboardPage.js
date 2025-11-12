import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, Settings } from 'lucide-react';

const DashboardPage = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Privacy Policy Generator
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">{user?.email}</span>
                        {user?.isAdmin && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                Admin
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {user?.status === 'PENDING' && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h2 className="font-semibold text-yellow-800 mb-2">
                            ⏳ Hesabınız Onay Bekliyor
                        </h2>
                        <p className="text-yellow-700">
                            Hesabınız yönetici tarafından onaylanması için beklemektedir.
                            Onaylandıktan sonra tüm özellikleri kullanabileceksiniz.
                        </p>
                    </div>
                )}

                {user?.status === 'REJECTED' && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="font-semibold text-red-800 mb-2">
                            ❌ Hesabınız Reddedildi
                        </h2>
                        <p className="text-red-700">
                            Maalesef, hesabınız yönetici tarafından reddedilmiştir.
                            Daha fazla bilgi için lütfen iletişime geçin.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create Document */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Yeni Doküman Oluştur
                            </h2>
                            <FileText className="w-8 h-8 text-indigo-600" />
                        </div>
                        <p className="text-gray-600 mb-6">
                            Privacy Policy ve Terms of Service belgeleri oluşturmak için
                            birkaç soruya cevap verin.
                        </p>
                        <Link
                            to="/create"
                            disabled={user?.status !== 'APPROVED'}
                            className={`inline-block px-6 py-2 rounded-lg font-medium transition ${user?.status === 'APPROVED'
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Başla
                        </Link>
                    </div>

                    {/* My Documents */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Dokümanlarım
                            </h2>
                            <FileText className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-gray-600 mb-6">
                            Oluşturduğunuz tüm Privacy Policy ve Terms of Service belgelerine erişin.
                        </p>
                        <Link
                            to="/documents"
                            disabled={user?.status !== 'APPROVED'}
                            className={`inline-block px-6 py-2 rounded-lg font-medium transition ${user?.status === 'APPROVED'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Görüntüle
                        </Link>
                    </div>

                    {/* Admin Panel */}
                    {user?.isAdmin && (
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Admin Paneli
                                </h2>
                                <Settings className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-gray-600 mb-6">
                                Yeni kullanıcıları onaylayın veya reddedin, sistemi yönetin.
                            </p>
                            <Link
                                to="/admin"
                                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                            >
                                Admin Paneli
                            </Link>
                        </div>
                    )}
                </div>

                {/* Information Cards */}
                <div className="mt-12 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Nasıl Çalışır?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-indigo-600 font-bold text-lg">1</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Sorulara Cevap Ver</h3>
                            <p className="text-sm text-gray-600">
                                Uygulamanız hakkında birkaç soruya cevap verin
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-indigo-600 font-bold text-lg">2</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">AI Oluştur</h3>
                            <p className="text-sm text-gray-600">
                                Gemini AI'ı kullanarak belgeler otomatik oluşturulur
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-indigo-600 font-bold text-lg">3</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Gözden Geçir</h3>
                            <p className="text-sm text-gray-600">
                                Oluşturulan belgeler hakkında karar verin
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-indigo-600 font-bold text-lg">4</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Yayınla</h3>
                            <p className="text-sm text-gray-600">
                                Belgelerinizi yayınlayın ve herkese açık hale getirin
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
