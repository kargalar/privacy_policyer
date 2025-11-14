import pool from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';

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

export const submitAnswers = async (userId, answers) => {
    try {
        // Mevcut cevapları sil
        await pool.query('DELETE FROM answers WHERE user_id = $1', [userId]);

        // Yeni cevapları ekle
        for (const answer of answers) {
            await pool.query(
                `INSERT INTO answers (id, user_id, question_id, value, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [uuidv4(), userId, answer.questionId, answer.value]
            );
        }

        return true;
    } catch (error) {
        throw error;
    }
};

export const getUserAnswers = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT q.id, q.question, a.value 
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.user_id = $1
       ORDER BY q.sort_order ASC`,
            [userId]
        );

        const answers = {};
        result.rows.forEach((row) => {
            answers[row.id] = row.value;
        });

        return answers;
    } catch (error) {
        throw error;
    }
};

export const getAnswersForGeneration = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT q.question, q.type, a.value 
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.user_id = $1
       ORDER BY q.sort_order ASC`,
            [userId]
        );

        return result.rows;
    } catch (error) {
        throw error;
    }
};
