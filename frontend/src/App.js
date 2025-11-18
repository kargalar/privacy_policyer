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
import DocumentsPage from './pages/DocumentsPage';
import DocumentPage from './pages/DocumentPage';
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

                        <Route
                            path="/documents"
                            element={
                                <ProtectedRoute>
                                    <DocumentsPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/documents/:id"
                            element={
                                <ProtectedRoute>
                                    <DocumentPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/documents/:appName/delete-request"
                            element={
                                <DeleteRequestPage />
                            }
                        />

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
                        <Route path="/" element={<Navigate to="/documents" />} />
                        <Route path="*" element={<Navigate to="/documents" />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ApolloProvider>
    );
}

export default App;
