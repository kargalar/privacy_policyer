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

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add username column if it doesn't exist
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
    `);

    console.log('✓ Users table created');

    // Questions table
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

    // Answers table
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

    // Documents table
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

    // Create admin user
    await pool.query(`
      INSERT INTO users (email, password, username, status, updated_at)
      VALUES ('admin@privacypolicy.com', '$2a$10$qZxZ.9Z9X8Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'admin', 'ADMIN', NOW())
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

// Public Privacy Policy endpoint
app.get('/public/:username/:appName/privacypolicy', async (req, res) => {
  try {
    const { username, appName } = req.params;

    // App name'i normalize et (boşlukları kaldır)
    const normalizedAppName = appName.replace(/-/g, ' ');

    console.log('🔍 Privacy Policy Request:');
    console.log('  Username:', username);
    console.log('  AppName (URL):', appName);
    console.log('  AppName (normalized):', normalizedAppName);

    const result = await pool.query(
      `SELECT d.privacy_policy, u.username, d.app_name
       FROM documents d
       JOIN users u ON d.user_id = u.id
       WHERE u.username = $1 AND LOWER(TRIM(d.app_name)) = LOWER(TRIM($2)) AND d.status = 'PUBLISHED'
       LIMIT 1`,
      [username, normalizedAppName]
    );

    console.log('  Found:', result.rows.length);
    if (result.rows.length === 0) {
      console.log('  ERROR: Document not found');
      return res.status(404).json({ error: 'Document not found' });
    }

    const { privacy_policy } = result.rows[0];
    res.type('text/plain').send(privacy_policy);
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public Terms of Service endpoint
app.get('/public/:username/:appName/termsofservice', async (req, res) => {
  try {
    const { username, appName } = req.params;

    // App name'i normalize et (boşlukları kaldır)
    const normalizedAppName = appName.replace(/-/g, ' ');

    const result = await pool.query(
      `SELECT d.terms_of_service, u.username, d.app_name
       FROM documents d
       JOIN users u ON d.user_id = u.id
       WHERE u.username = $1 AND LOWER(TRIM(d.app_name)) = LOWER(TRIM($2)) AND d.status = 'PUBLISHED'
       LIMIT 1`,
      [username, normalizedAppName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { terms_of_service } = result.rows[0];
    res.type('text/plain').send(terms_of_service);
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  includeStacktraceInErrorResponses: true,
  formatError: (error) => {
    console.error('GraphQL Error:', {
      message: error.message,
      locations: error.locations,
      path: error.path,
      originalError: error.originalError?.message,
    });
    return error;
  },
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