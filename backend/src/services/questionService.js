import pool from '../utils/database.js';

export const getQuestions = async () => {
    try {
        const result = await pool.query(
            `SELECT id, question, description, type, required, options, sort_order 
       FROM questions 
       ORDER BY sort_order ASC`
        );
        return result.rows.map((row) => ({
            id: row.id,
            question: row.question,
            description: row.description,
            type: row.type,
            required: row.required,
            options: row.options ? JSON.parse(JSON.stringify(row.options)) : null,
            sortOrder: row.sort_order,
        }));
    } catch (error) {
        throw error;
    }
};

