import * as userService from '../services/userService.js';
import * as questionService from '../services/questionService.js';
import * as documentService from '../services/documentService.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const resolvers = {
    Query: {
        me: async (_, __, context) => {
            const user = requireAuth(context);
            const userData = await userService.getUserById(user.id);
            return {
                ...userData,
                fullName: userData.full_name,
                isAdmin: userData.is_admin,
                createdAt: new Date().toISOString(),
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

            return doc;
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
            return await userService.getPendingUsers();
        },

        allUsers: async (_, __, context) => {
            requireAdmin(context);
            return await userService.getAllUsers();
        },
    },

    Mutation: {
        register: async (_, { email, password, fullName }) => {
            const user = await userService.registerUser(email, password, fullName);
            return {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                status: user.status,
                isAdmin: user.is_admin,
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
                    fullName: user.fullName,
                    status: user.status,
                    isAdmin: user.isAdmin,
                    createdAt: new Date().toISOString(),
                },
            };
        },

        submitAnswers: async (_, { answers }, context) => {
            const user = requireAuth(context);
            await questionService.submitAnswers(user.id, answers);
            return true;
        },

        generateDocuments: async (_, { appName, answers }, context) => {
            const user = requireAuth(context);

            // Cevapları kaydet
            await questionService.submitAnswers(user.id, answers);

            // Cevaplardan app data oluştur
            const appData = {};
            for (const answer of answers) {
                // Answer'ın question'ını bul
                const questions = await questionService.getQuestions();
                const question = questions.find((q) => q.id === answer.questionId);

                if (question) {
                    const key = question.question.toLowerCase()
                        .replace(/[^a-z0-9]/g, '')
                        .replace(/\s+/g, '');
                    appData[key] = answer.value;
                }
            }

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

            const updated = await documentService.publishDocument(documentId);
            return {
                ...updated,
                userId: updated.user_id,
                appName: updated.app_name,
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

        approveUser: async (_, { userId }, context) => {
            requireAdmin(context);
            const user = await userService.approveUser(userId);
            return {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                status: user.status,
                isAdmin: false,
                createdAt: new Date().toISOString(),
            };
        },

        rejectUser: async (_, { userId }, context) => {
            requireAdmin(context);
            const user = await userService.rejectUser(userId);
            return {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                status: user.status,
                isAdmin: false,
                createdAt: new Date().toISOString(),
            };
        },
    },
};
