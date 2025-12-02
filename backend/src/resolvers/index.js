import * as userService from '../services/userService.js';
import * as questionService from '../services/questionService.js';
import * as documentService from '../services/documentService.js';
import * as imageService from '../services/imageService.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const resolvers = {
    Query: {
        me: async (_, __, context) => {
            const user = requireAuth(context);
            const userData = await userService.getUserById(user.id);
            return {
                id: userData.id,
                email: userData.email,
                username: userData.username || userData.email.split('@')[0],
                status: userData.status,
                createdAt: userData.created_at ? new Date(userData.created_at).toISOString() : new Date().toISOString(),
            };
        },

        questions: async () => {
            return await questionService.getQuestions();
        },

        myDocuments: async (_, __, context) => {
            const user = requireAuth(context);
            return await documentService.getUserDocuments(user.id);
        },

        document: async (_, { id }, context) => {
            const user = requireAuth(context);
            const doc = await documentService.getDocumentById(id);

            if (!doc || doc.userId !== user.id) {
                throw new Error('Document not found or access denied');
            }

            return {
                ...doc,
                deleteRequests: doc.deleteRequests || [],
            };
        },

        documentByApp: async (_, { appName }, context) => {
            const user = requireAuth(context);
            const doc = await documentService.getDocumentByUserIdAndAppName(user.id, appName);

            if (!doc) {
                return null;
            }

            return doc;
        },

        pendingUsers: async (_, __, context) => {
            requireAdmin(context);
            const users = await userService.getPendingUsers();
            return users.map(user => ({
                id: user.id,
                email: user.email,
                username: user.username || user.email.split('@')[0],
                status: user.status,
                createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
            }));
        },

        allUsers: async (_, __, context) => {
            requireAdmin(context);
            const users = await userService.getAllUsers();
            return users.map(user => ({
                id: user.id,
                email: user.email,
                username: user.username || user.email.split('@')[0],
                status: user.status,
                createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
            }));
        },

        publicDocument: async (_, { username, appName }) => {
            // No auth required - public access
            const user = await userService.getUserByUsername(username);
            if (!user) {
                throw new Error('User not found');
            }

            const doc = await documentService.getPublishedDocumentByUsernameAndAppName(username, appName);
            if (!doc) {
                throw new Error('Document not found or not published');
            }

            return doc;
        },

        // App Images queries
        appImages: async (_, { documentId }, context) => {
            const user = requireAuth(context);
            const doc = await documentService.getDocumentById(documentId);

            if (!doc || doc.userId !== user.id) {
                throw new Error('Document not found or access denied');
            }

            return await imageService.getImagesByDocumentId(documentId);
        },

        appImage: async (_, { id }, context) => {
            const user = requireAuth(context);
            const image = await imageService.getImageById(id);

            if (!image) {
                throw new Error('Image not found');
            }

            // Verify ownership through document
            const doc = await documentService.getDocumentById(image.documentId);
            if (!doc || doc.userId !== user.id) {
                throw new Error('Access denied');
            }

            return image;
        },
    },

    Mutation: {
        register: async (_, { email, password, username }) => {
            const user = await userService.registerUser(email, password, username);
            return {
                id: user.id,
                email: user.email,
                username: user.username,
                status: user.status,
                createdAt: user.created_at,
            };
        },

        login: async (_, { email, password }) => {
            const { token, user } = await userService.loginUser(email, password);
            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    status: user.status,
                    createdAt: new Date().toISOString(),
                },
            };
        },

        generateDocuments: async (_, { appName, answers }, context) => {
            const user = requireAuth(context);

            // Cevaplardan app data oluştur
            const appData = { appName }; // appName'i ekle
            const questions = await questionService.getQuestions();

            for (const answer of answers) {
                // Answer'ın question'ını bul
                const question = questions.find((q) => q.id === answer.questionId);

                if (question) {
                    const key = question.question.toLowerCase()
                        .replace(/[^a-z0-9]/g, '')
                        .replace(/\s+/g, '');
                    appData[key] = answer.value;
                }
            }

            console.log('Generated appData:', appData);

            // Dokümanları oluştur
            const document = await documentService.createDocument(user.id, appName, appData);

            return document;
        },

        approveDocument: async (_, { documentId }, context) => {
            const user = requireAuth(context);
            const doc = await documentService.getDocumentById(documentId);

            if (!doc || doc.userId !== user.id) {
                throw new Error('Document not found or access denied');
            }

            const updated = await documentService.approveDocument(documentId);
            return {
                ...updated,
                userId: updated.user_id,
                appName: updated.app_name,
            };
        },

        publishDocument: async (_, { documentId }, context) => {
            const user = requireAuth(context);
            const doc = await documentService.getDocumentById(documentId);

            if (!doc || doc.userId !== user.id) {
                throw new Error('Document not found or access denied');
            }

            // DRAFT veya APPROVED durumundaki dokümanı PUBLISHED yap
            const updated = await documentService.publishDocument(documentId);
            return {
                id: updated.id,
                userId: updated.user_id,
                appName: updated.app_name,
                privacyPolicy: updated.privacy_policy,
                termsOfService: updated.terms_of_service,
                status: updated.status,
                createdAt: updated.created_at,
                updatedAt: updated.updated_at,
            };
        },

        unpublishDocument: async (_, { documentId }, context) => {
            const user = requireAuth(context);
            const doc = await documentService.getDocumentById(documentId);

            if (!doc || doc.userId !== user.id) {
                throw new Error('Document not found or access denied');
            }

            // PUBLISHED durumundaki dokümanı DRAFT'a döndür
            const updated = await documentService.unpublishDocument(documentId);
            return {
                id: updated.id,
                userId: updated.user_id,
                appName: updated.app_name,
                privacyPolicy: updated.privacy_policy,
                termsOfService: updated.terms_of_service,
                status: updated.status,
                createdAt: updated.created_at,
                updatedAt: updated.updated_at,
            };
        },

        deleteDocument: async (_, { documentId }, context) => {
            const user = requireAuth(context);
            const doc = await documentService.getDocumentById(documentId);

            if (!doc || doc.userId !== user.id) {
                throw new Error('Document not found or access denied');
            }

            return await documentService.deleteDocument(documentId);
        },

        createDeleteRequest: async (_, { appName, email }, context) => {
            // Bu endpoint public olabilir - context'i kontrol etmek isteğe bağlı
            // Normalized app name ile document'ı bul
            const normalizeAppName = (name) => {
                return name.trim().replace(/\s+/g, '-').toLowerCase();
            };
            const normalizedAppName = normalizeAppName(appName);

            const doc = await documentService.getDocumentByNormalizedAppName(normalizedAppName);

            if (!doc) {
                throw new Error('Document not found');
            }

            // Doküman published olmalı
            if (doc.status !== 'PUBLISHED') {
                throw new Error('Document must be published to create delete requests');
            }

            const deleteRequest = await documentService.createDeleteRequest(doc.id, email);
            return {
                id: deleteRequest.id,
                documentId: deleteRequest.document_id,
                email: deleteRequest.email,
                createdAt: deleteRequest.created_at,
            };
        },

        updateDocument: async (_, { documentId, appName, appDescription, privacyPolicy, termsOfService }, context) => {
            const user = requireAuth(context);
            const doc = await documentService.getDocumentById(documentId);

            if (!doc || doc.userId !== user.id) {
                throw new Error('Document not found or access denied');
            }

            // DRAFT durumunda doküman düzenlenebilir
            if (doc.status !== 'DRAFT') {
                throw new Error('Only DRAFT documents can be edited');
            }

            const updated = await documentService.updateDocument(
                documentId,
                appName,
                appDescription,
                privacyPolicy,
                termsOfService
            );

            return {
                id: updated.id,
                userId: updated.user_id,
                appName: updated.app_name,
                appDescription: updated.app_description,
                privacyPolicy: updated.privacy_policy,
                termsOfService: updated.terms_of_service,
                status: updated.status,
                createdAt: updated.created_at,
                updatedAt: updated.updated_at,
            };
        },

        approveUser: async (_, { userId }, context) => {
            requireAdmin(context);
            const user = await userService.approveUser(userId);
            const userData = await userService.getUserById(userId);
            return {
                id: user.id,
                email: user.email,
                username: user.username || user.email.split('@')[0],
                status: user.status,
                createdAt: userData?.created_at ? new Date(userData.created_at).toISOString() : new Date().toISOString(),
            };
        },

        rejectUser: async (_, { userId }, context) => {
            requireAdmin(context);
            const user = await userService.rejectUser(userId);
            const userData = await userService.getUserById(userId);
            return {
                id: user.id,
                email: user.email,
                username: user.username || user.email.split('@')[0],
                status: user.status,
                createdAt: userData?.created_at ? new Date(userData.created_at).toISOString() : new Date().toISOString(),
            };
        },

        // App Image mutations
        generateAppImage: async (_, { documentId, imageType, style, prompt, referenceImages, transparentBackground }, context) => {
            const user = requireAuth(context);
            const doc = await documentService.getDocumentById(documentId);

            if (!doc || doc.userId !== user.id) {
                throw new Error('Document not found or access denied');
            }

            return await imageService.createAppImage(documentId, imageType, style || 'modern', prompt || '', referenceImages || [], transparentBackground || false);
        },

        deleteAppImage: async (_, { imageId }, context) => {
            const user = requireAuth(context);
            const image = await imageService.getImageById(imageId);

            if (!image) {
                throw new Error('Image not found');
            }

            // Verify ownership through document
            const doc = await documentService.getDocumentById(image.documentId);
            if (!doc || doc.userId !== user.id) {
                throw new Error('Access denied');
            }

            return await imageService.deleteAppImage(imageId);
        },
    },
};
