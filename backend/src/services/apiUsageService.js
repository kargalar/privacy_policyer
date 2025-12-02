import pool from '../utils/database.js';

// Pricing per 1M tokens (as of Dec 2024)
// https://ai.google.dev/pricing
const PRICING = {
    'gemini-2.5-flash': {
        input: 0.075,   // $0.075 per 1M input tokens
        output: 0.30,   // $0.30 per 1M output tokens
    },
    'gemini-3-pro-image-preview': {
        input: 0.0315,  // $0.0315 per 1M input tokens (estimated for image)
        output: 0.0315, // Images are priced differently - this is approximate
        perImage: 0.02, // Approximate cost per generated image
    },
};

/**
 * Calculate cost based on token usage
 * @param {string} modelName - The model used
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @param {number} imageCount - Number of images generated (for image models)
 * @returns {number} Cost in USD
 */
export const calculateCost = (modelName, inputTokens = 0, outputTokens = 0, imageCount = 0) => {
    const pricing = PRICING[modelName] || PRICING['gemini-2.5-flash'];
    
    let cost = 0;
    
    // Token-based cost
    cost += (inputTokens / 1_000_000) * pricing.input;
    cost += (outputTokens / 1_000_000) * pricing.output;
    
    // Per-image cost (for image generation)
    if (pricing.perImage && imageCount > 0) {
        cost += imageCount * pricing.perImage;
    }
    
    return cost;
};

/**
 * Log API usage to database
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.documentId - Document ID (optional)
 * @param {string} params.usageType - 'DOCUMENT_GENERATION' or 'IMAGE_GENERATION'
 * @param {string} params.modelName - Model name used
 * @param {number} params.inputTokens - Input tokens used
 * @param {number} params.outputTokens - Output tokens used
 * @param {number} params.imageCount - Number of images generated
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} The created usage record
 */
export const logApiUsage = async ({
    userId,
    documentId = null,
    usageType,
    modelName,
    inputTokens = 0,
    outputTokens = 0,
    imageCount = 0,
    metadata = {},
}) => {
    const cost = calculateCost(modelName, inputTokens, outputTokens, imageCount);
    
    const result = await pool.query(
        `INSERT INTO api_usage (user_id, document_id, usage_type, model_name, input_tokens, output_tokens, cost_usd, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, documentId, usageType, modelName, inputTokens, outputTokens, cost, JSON.stringify(metadata)]
    );
    
    return result.rows[0];
};

/**
 * Get usage statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Usage statistics
 */
export const getUserUsageStats = async (userId) => {
    // Total usage
    const totalResult = await pool.query(
        `SELECT 
            COUNT(*) as total_requests,
            COALESCE(SUM(input_tokens), 0) as total_input_tokens,
            COALESCE(SUM(output_tokens), 0) as total_output_tokens,
            COALESCE(SUM(cost_usd), 0) as total_cost
         FROM api_usage 
         WHERE user_id = $1`,
        [userId]
    );

    // Usage by type
    const byTypeResult = await pool.query(
        `SELECT 
            usage_type,
            COUNT(*) as requests,
            COALESCE(SUM(cost_usd), 0) as cost
         FROM api_usage 
         WHERE user_id = $1
         GROUP BY usage_type`,
        [userId]
    );

    // Usage by document
    const byDocumentResult = await pool.query(
        `SELECT 
            au.document_id,
            d.app_name,
            COUNT(*) as requests,
            COALESCE(SUM(au.cost_usd), 0) as cost
         FROM api_usage au
         LEFT JOIN documents d ON au.document_id = d.id
         WHERE au.user_id = $1 AND au.document_id IS NOT NULL
         GROUP BY au.document_id, d.app_name
         ORDER BY cost DESC`,
        [userId]
    );

    // Recent usage (last 30 days)
    const recentResult = await pool.query(
        `SELECT 
            DATE(created_at) as date,
            COUNT(*) as requests,
            COALESCE(SUM(cost_usd), 0) as cost
         FROM api_usage 
         WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [userId]
    );

    const total = totalResult.rows[0];
    
    return {
        totalRequests: parseInt(total.total_requests),
        totalInputTokens: parseInt(total.total_input_tokens),
        totalOutputTokens: parseInt(total.total_output_tokens),
        totalCost: parseFloat(total.total_cost),
        byType: byTypeResult.rows.map(row => ({
            type: row.usage_type,
            requests: parseInt(row.requests),
            cost: parseFloat(row.cost),
        })),
        byDocument: byDocumentResult.rows.map(row => ({
            documentId: row.document_id,
            appName: row.app_name,
            requests: parseInt(row.requests),
            cost: parseFloat(row.cost),
        })),
        dailyUsage: recentResult.rows.map(row => ({
            date: row.date,
            requests: parseInt(row.requests),
            cost: parseFloat(row.cost),
        })),
    };
};

/**
 * Get usage for a specific document
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Document usage
 */
export const getDocumentUsage = async (documentId) => {
    const result = await pool.query(
        `SELECT 
            usage_type,
            model_name,
            input_tokens,
            output_tokens,
            cost_usd,
            metadata,
            created_at
         FROM api_usage 
         WHERE document_id = $1
         ORDER BY created_at DESC`,
        [documentId]
    );

    const totalResult = await pool.query(
        `SELECT 
            COALESCE(SUM(cost_usd), 0) as total_cost,
            COUNT(*) as total_requests
         FROM api_usage 
         WHERE document_id = $1`,
        [documentId]
    );

    return {
        totalCost: parseFloat(totalResult.rows[0].total_cost),
        totalRequests: parseInt(totalResult.rows[0].total_requests),
        history: result.rows.map(row => ({
            usageType: row.usage_type,
            modelName: row.model_name,
            inputTokens: row.input_tokens,
            outputTokens: row.output_tokens,
            cost: parseFloat(row.cost_usd),
            metadata: row.metadata,
            createdAt: row.created_at,
        })),
    };
};

export default {
    logApiUsage,
    calculateCost,
    getUserUsageStats,
    getDocumentUsage,
};
