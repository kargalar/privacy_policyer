import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';

export const registerUser = async (email, password, username) => {
    try {
        // Email zaten mevcut mu kontrolü
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            throw new Error('Email already registered');
        }

        // Username zaten mevcut mu kontrolü
        const existingUsername = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existingUsername.rows.length > 0) {
            throw new Error('Username already taken');
        }

        // Password hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı ekle
        const result = await pool.query(
            `INSERT INTO users (id, email, password, username, status, updated_at) 
       VALUES ($1, $2, $3, $4, 'PENDING', NOW()) 
       RETURNING id, email, username, status, created_at`,
            [uuidv4(), email, hashedPassword, username]
        );

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (email, password) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = result.rows[0];

        // Eğer kullanıcı onaylanmamışsa giriş yapamaz (APPROVED veya ADMIN)
        if (user.status !== 'APPROVED' && user.status !== 'ADMIN') {
            throw new Error('Your account is pending approval by an administrator');
        }

        // Password kontrolü
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid password');
        }

        // JWT token oluştur
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                status: user.status,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username || user.email.split('@')[0],
                status: user.status,
            },
        };
    } catch (error) {
        throw error;
    }
};

export const getPendingUsers = async () => {
    try {
        const result = await pool.query(
            `SELECT id, email, username, status, created_at 
       FROM users 
       WHERE status = 'PENDING' 
       ORDER BY created_at DESC`
        );
        return result.rows;
    } catch (error) {
        throw error;
    }
};

export const approveUser = async (userId) => {
    try {
        const result = await pool.query(
            `UPDATE users 
       SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, email, username, status`,
            [userId]
        );

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const rejectUser = async (userId) => {
    try {
        const result = await pool.query(
            `UPDATE users 
       SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, email, username, status`,
            [userId]
        );

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT id, email, username, status 
       FROM users 
       WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const result = await pool.query(
            `SELECT id, email, username, status, created_at 
       FROM users 
       ORDER BY created_at DESC`
        );
        return result.rows;
    } catch (error) {
        throw error;
    }
};

export const getUserByUsername = async (username) => {
    try {
        const result = await pool.query(
            `SELECT id, email, username, status 
       FROM users 
       WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};
