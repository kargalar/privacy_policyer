import pool from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';

const seedQuestions = async () => {
    try {
        console.log('Seeding questions...');

        const questions = [
            {
                question: 'What is the name of your application?',
                description: 'Please enter the full name of your application',
                type: 'TEXT',
                required: true,
                sortOrder: 1,
            },
            {
                question: 'What type of application is it?',
                description: 'Select the type that best describes your application',
                type: 'SELECT',
                required: true,
                options: ['Web', 'Mobile', 'Desktop', 'CLI', 'Other'],
                sortOrder: 2,
            },
            {
                question: 'Contact email address',
                description: 'Email address where users can contact you',
                type: 'EMAIL',
                required: true,
                sortOrder: 3,
            },
            {
                question: 'Do you collect phone numbers?',
                description: 'Does your application collect phone numbers from users?',
                type: 'BOOLEAN',
                required: true,
                sortOrder: 4,
            },
            {
                question: 'Do you collect voice or video data?',
                description: 'Does your application record voice calls or video?',
                type: 'BOOLEAN',
                required: true,
                sortOrder: 5,
            },
            {
                question: 'Do you collect payment information?',
                description: 'Does your application collect credit card or other payment information?',
                type: 'BOOLEAN',
                required: true,
                sortOrder: 6,
            },
            {
                question: 'Do you have social media integration?',
                description: 'Is your application integrated with social media platforms? (Facebook, Google, etc.)',
                type: 'TEXT',
                required: false,
                sortOrder: 7,
            },
            {
                question: 'Do you use third-party services?',
                description: 'Does your application use external APIs or services (Analytics, Firebase, etc.)?',
                type: 'TEXTAREA',
                required: false,
                sortOrder: 8,
            },
        ];

        for (const q of questions) {
            await pool.query(
                `INSERT INTO questions (id, question, description, type, required, options, sort_order, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT DO NOTHING`,
                [
                    uuidv4(),
                    q.question,
                    q.description,
                    q.type,
                    q.required,
                    q.options ? JSON.stringify(q.options) : null,
                    q.sortOrder,
                ]
            );
        }

        console.log('✓ Questions seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding questions:', error);
        process.exit(1);
    }
};

seedQuestions();
