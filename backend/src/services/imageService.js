import pool from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';
import { generateAndUploadImage } from './imageGenerationService.js';
import { deleteImage } from './cloudinaryService.js';
import { logApiUsage } from './apiUsageService.js';

/**
 * Get all images for a document
 * @param {string} documentId
 * @returns {Promise<Array>}
 */
export const getImagesByDocumentId = async (documentId) => {
    const result = await pool.query(
        `SELECT id, document_id, image_type, style, prompt, cloudinary_url, cloudinary_id, width, height, created_at 
         FROM app_images 
         WHERE document_id = $1 
         ORDER BY created_at DESC`,
        [documentId]
    );

    return result.rows.map(formatImage);
};

/**
 * Get a single image by ID
 * @param {string} imageId
 * @returns {Promise<Object|null>}
 */
export const getImageById = async (imageId) => {
    const result = await pool.query(
        `SELECT id, document_id, image_type, style, prompt, cloudinary_url, cloudinary_id, width, height, created_at 
         FROM app_images 
         WHERE id = $1`,
        [imageId]
    );

    return result.rows.length > 0 ? formatImage(result.rows[0]) : null;
};

/**
 * Generate and save a new app image
 * @param {string} documentId
 * @param {string} imageType - APP_ICON, FEATURE_GRAPHIC, STORE_SCREENSHOT
 * @param {string} style - Style preference
 * @param {string[]} colors - Color preferences
 * @param {string} prompt - Additional prompt details
 * @param {string} requiredText - Text that must appear in the image
 * @param {boolean} onlyRequiredText - Only include required text, no other text
 * @param {string[]} referenceImages - Base64 encoded reference images
 * @param {boolean} transparentBackground - Whether to use transparent background (for icons)
 * @param {string} userId - User ID for API usage tracking
 * @param {boolean} includeText - Whether to include text in the image
 * @param {boolean} includeAppName - Whether to include app name (for feature graphics)
 * @returns {Promise<Object>}
 */
export const createAppImage = async (documentId, imageType, style = 'origami', colors = [], prompt = '', requiredText = '', onlyRequiredText = false, referenceImages = [], transparentBackground = false, userId = null, includeText = false, includeAppName = true) => {
    // Get document info for app name and description
    const docResult = await pool.query(
        `SELECT app_name, app_description, user_id FROM documents WHERE id = $1`,
        [documentId]
    );

    if (docResult.rows.length === 0) {
        throw new Error('Document not found');
    }

    const document = docResult.rows[0];
    const effectiveUserId = userId || document.user_id;

    // Generate and upload image
    const result = await generateAndUploadImage(
        imageType,
        document.app_name,
        document.app_description || '',
        style,
        colors,
        prompt,
        requiredText,
        onlyRequiredText,
        documentId,
        referenceImages,
        transparentBackground,
        includeText,
        includeAppName
    );

    // Log API usage
    try {
        await logApiUsage({
            userId: effectiveUserId,
            documentId,
            usageType: 'IMAGE_GENERATION',
            modelName: 'gemini-3-pro-image-preview',
            inputTokens: 500, // Approximate for image generation
            outputTokens: 0,
            imageCount: 1,
            metadata: {
                imageType,
                style,
                transparentBackground,
                hasReferenceImages: referenceImages.length > 0,
                includeText,
                includeAppName,
            },
        });
    } catch (error) {
        console.error('Failed to log API usage:', error);
        // Don't fail the request if logging fails
    }

    // Save to database
    const insertResult = await pool.query(
        `INSERT INTO app_images (id, document_id, image_type, style, prompt, cloudinary_url, cloudinary_id, width, height, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         RETURNING id, document_id, image_type, style, prompt, cloudinary_url, cloudinary_id, width, height, created_at`,
        [
            uuidv4(),
            documentId,
            imageType,
            style,
            prompt || null,
            result.url,
            result.publicId,
            result.width,
            result.height,
        ]
    );

    return formatImage(insertResult.rows[0]);
};

/**
 * Delete an app image
 * @param {string} imageId
 * @returns {Promise<boolean>}
 */
export const deleteAppImage = async (imageId) => {
    const result = await pool.query(
        `SELECT cloudinary_id FROM app_images WHERE id = $1`,
        [imageId]
    );

    if (result.rows.length === 0) {
        throw new Error('Image not found');
    }

    const cloudinaryId = result.rows[0].cloudinary_id;

    // Delete from Cloudinary
    try {
        await deleteImage(cloudinaryId);
    } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
        // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await pool.query(`DELETE FROM app_images WHERE id = $1`, [imageId]);

    return true;
};

/**
 * Format image object for GraphQL response
 * @param {Object} row
 * @returns {Object}
 */
const formatImage = (row) => ({
    id: row.id,
    documentId: row.document_id,
    imageType: row.image_type,
    style: row.style,
    prompt: row.prompt,
    cloudinaryUrl: row.cloudinary_url,
    cloudinaryId: row.cloudinary_id,
    width: row.width,
    height: row.height,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
});
