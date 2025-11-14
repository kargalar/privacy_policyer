import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';

export const registerUser = async (email, password, fullName, username) => {
    try {
        // Email zaten mevcut mu kontrolü
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            throw new Error('Email already registered');
        }

        // Username zaten mevcut mu kontrolü
        if (username) {
            const existingUsername = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
            if (existingUsername.rows.length > 0) {
                throw new Error('Username already taken');
            }
        }

        // Password hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı ekle
        const result = await pool.query(
            `INSERT INTO users (id, email, password, full_name, username, status, is_admin, updated_at) 
       VALUES ($1, $2, $3, $4, $5, 'PENDING', FALSE, NOW()) 
       RETURNING id, email, full_name, username, status, is_admin, created_at`,
            [uuidv4(), email, hashedPassword, fullName, username || email.split('@')[0]]
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

        // Eğer kullanıcı onaylanmamışsa giriş yapamaz
        if (user.status !== 'APPROVED') {
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
                isAdmin: user.is_admin,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                isAdmin: user.is_admin,
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
            `SELECT id, email, full_name, status, created_at 
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
       RETURNING id, email, full_name, status`,
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
       RETURNING id, email, full_name, status`,
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
            `SELECT id, email, full_name, username, status, is_admin 
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
            `SELECT id, email, full_name, status, is_admin, created_at 
       FROM users 
       ORDER BY created_at DESC`
        );
        return result.rows;
    } catch (error) {
        throw error;
    }
};
