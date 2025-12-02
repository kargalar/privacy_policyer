import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './utils/apolloClient';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePage from './pages/CreatePage';
import AppsPage from './pages/AppsPage';
import AppDetailPage from './pages/AppDetailPage';
import DeleteRequestPage from './pages/DeleteRequestPage';
import AdminPage from './pages/AdminPage';
import ApprovalPage from './pages/ApprovalPage';
import PublicDocumentPage from './pages/PublicDocumentPage';

import './App.css';

function App() {
    return (
        <ApolloProvider client={client}>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Public Document Routes - No Authentication Required */}
                        <Route path="/public/:username/:appName/:type" element={<PublicDocumentPage />} />

                        {/* Protected Routes */}
                        <Route
                            path="/create"
                            element={
                                <ProtectedRoute>
                                    <CreatePage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Apps Routes (formerly Documents) */}
                        <Route
                            path="/apps"
                            element={
                                <ProtectedRoute>
                                    <AppsPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/apps/:id"
                            element={
                                <ProtectedRoute>
                                    <AppDetailPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/apps/:id/:tab"
                            element={
                                <ProtectedRoute>
                                    <AppDetailPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/apps/:appName/delete-request"
                            element={
                                <DeleteRequestPage />
                            }
                        />

                        {/* Legacy route redirects */}
                        <Route path="/documents" element={<Navigate to="/apps" replace />} />
                        <Route path="/documents/:id" element={<Navigate to="/apps" replace />} />

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/approvals"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <ApprovalPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/apps" />} />
                        <Route path="*" element={<Navigate to="/apps" />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ApolloProvider>
    );
}

export default App;
