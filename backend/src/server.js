import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import { typeDefs } from './schema.graphql.js';
import { resolvers } from './resolvers/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

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