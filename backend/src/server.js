import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import { typeDefs } from './schema.graphql.js';
import { resolvers } from './resolvers/index.js';
import dotenv from 'dotenv';
import pool from './utils/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Database initialization
const initDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Users tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'PENDING',
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Questions tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        required BOOLEAN DEFAULT TRUE,
        options JSONB,
        sort_order INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Questions table created');

    // Answers tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, question_id)
      );
    `);
    console.log('✓ Answers table created');

    // Documents tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        app_name VARCHAR(255) NOT NULL,
        privacy_policy TEXT,
        terms_of_service TEXT,
        status VARCHAR(50) DEFAULT 'DRAFT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Documents table created');

    // Admin kullanıcısı oluştur
    await pool.query(`
      INSERT INTO users (email, password, full_name, status, is_admin, updated_at)
      VALUES ('admin@privacypolicy.com', '$2a$10$qZxZ.9Z9X8Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'Admin', 'APPROVED', TRUE, NOW())
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✓ Admin user created');

    console.log('✓ Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
});

// Start server
const startServer = async () => {
  try {
    // Initialize database first
    await initDatabase();

    await server.start();

    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => ({ req }),
      })
    );

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});