import pool from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';
import { generateDocuments } from './geminiService.js';

export const createDocument = async (userId, appName, appData) => {
    try {
        // Gemini ile dokümanları oluştur
        console.log('Creating documents with Gemini API...');
        console.log('AppData received:', appData);

        const { privacyPolicy, termsOfService } = await generateDocuments({
            appName,
            ...appData,
        });

        console.log('✓ Documents generated successfully');

        // Veritabanına kaydet
        const result = await pool.query(
            `INSERT INTO documents (id, user_id, app_name, privacy_policy, terms_of_service, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, 'DRAFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, user_id, app_name, status, created_at, updated_at`,
            [uuidv4(), userId, appName, privacyPolicy, termsOfService]
        );

        console.log('✓ Document saved to database:', result.rows[0].id);

        return {
            id: result.rows[0].id,
            userId: result.rows[0].user_id,
            appName: result.rows[0].app_name,
            privacyPolicy,
            termsOfService,
            status: result.rows[0].status,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
        };
    } catch (error) {
        console.error('DocumentService.createDocument Error:', error.message);
        throw error;
    }
};

export const getUserDocuments = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT id, user_id, app_name, status, created_at, updated_at 
       FROM documents 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
            [userId]
        );

        return result.rows.map((row) => ({
            id: row.id,
            userId: row.user_id,
            appName: row.app_name,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));
    } catch (error) {
        throw error;
    }
};

export const getDocumentById = async (documentId) => {
    try {
        const result = await pool.query(
            `SELECT id, user_id, app_name, privacy_policy, terms_of_service, status, created_at, updated_at 
       FROM documents 
       WHERE id = $1`,
            [documentId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.id,
            userId: row.user_id,
            appName: row.app_name,
            privacyPolicy: row.privacy_policy,
            termsOfService: row.terms_of_service,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    } catch (error) {
        throw error;
    }
};

export const getDocumentByUserIdAndAppName = async (userId, appName) => {
    try {
        const result = await pool.query(
            `SELECT id, user_id, app_name, privacy_policy, terms_of_service, status, created_at, updated_at 
       FROM documents 
       WHERE user_id = $1 AND app_name = $2
       LIMIT 1`,
            [userId, appName]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.id,
            userId: row.user_id,
            appName: row.app_name,
            privacyPolicy: row.privacy_policy,
            termsOfService: row.terms_of_service,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    } catch (error) {
        throw error;
    }
};

export const approveDocument = async (documentId) => {
    try {
        const result = await pool.query(
            `UPDATE documents 
       SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, user_id, app_name, status, updated_at`,
            [documentId]
        );

        if (result.rows.length === 0) {
            throw new Error('Document not found');
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const publishDocument = async (documentId) => {
    try {
        const result = await pool.query(
            `UPDATE documents 
       SET status = 'PUBLISHED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, user_id, app_name, status, updated_at`,
            [documentId]
        );

        if (result.rows.length === 0) {
            throw new Error('Document not found');
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const unpublishDocument = async (documentId) => {
    try {
        const result = await pool.query(
            `UPDATE documents 
       SET status = 'DRAFT', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, user_id, app_name, privacy_policy, terms_of_service, status, created_at, updated_at`,
            [documentId]
        );

        if (result.rows.length === 0) {
            throw new Error('Document not found');
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const updateDocument = async (documentId, appName, privacyPolicy, termsOfService) => {
    try {
        const result = await pool.query(
            `UPDATE documents 
       SET app_name = $1, privacy_policy = $2, terms_of_service = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING id, user_id, app_name, privacy_policy, terms_of_service, status, created_at, updated_at`,
            [appName, privacyPolicy, termsOfService, documentId]
        );

        if (result.rows.length === 0) {
            throw new Error('Document not found');
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const deleteDocument = async (documentId) => {
    try {
        const result = await pool.query(
            `DELETE FROM documents 
       WHERE id = $1 
       RETURNING id`,
            [documentId]
        );

        if (result.rows.length === 0) {
            throw new Error('Document not found');
        }

        return true;
    } catch (error) {
        throw error;
    }
};

export const getPublishedDocumentByUsernameAndAppName = async (username, appName) => {
    try {
        // Normalize app name to match the stored format
        const normalizedAppName = appName.trim().replace(/\s+/g, '-').toLowerCase();

        const result = await pool.query(
            `SELECT d.id, d.user_id, d.app_name, d.privacy_policy, d.terms_of_service, d.status, d.created_at, d.updated_at 
       FROM documents d
       JOIN users u ON d.user_id = u.id
       WHERE u.username = $1 AND (LOWER(REPLACE(d.app_name, ' ', '-')) = $2 OR d.app_name = $3) AND d.status = 'PUBLISHED'
       LIMIT 1`,
            [username, normalizedAppName, appName]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.id,
            userId: row.user_id,
            appName: row.app_name,
            privacyPolicy: row.privacy_policy,
            termsOfService: row.terms_of_service,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    } catch (error) {
        throw error;
    }
};
