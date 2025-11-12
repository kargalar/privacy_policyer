import pool from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';

const seedQuestions = async () => {
    try {
        console.log('Seeding questions...');

        const questions = [
            {
                question: 'Uygulamanızın adı nedir?',
                description: 'Lütfen uygulamanızın tam adını yazın',
                type: 'TEXT',
                required: true,
                sortOrder: 1,
            },
            {
                question: 'Uygulamanızın türü nedir?',
                description: 'Uygulamanızı en iyi tanımlayan türü seçin',
                type: 'SELECT',
                required: true,
                options: ['Web', 'Mobil', 'Desktop', 'CLI', 'Diğer'],
                sortOrder: 2,
            },
            {
                question: 'İletişim e-posta adresi',
                description: 'Kullanıcılar sizinle iletişim kurabilecekleri e-posta adresi',
                type: 'EMAIL',
                required: true,
                sortOrder: 3,
            },
            {
                question: 'Telefon numarası toplamısınız?',
                description: 'Uygulamanız kullanıcılardan telefon numarası topluyor mu?',
                type: 'BOOLEAN',
                required: true,
                sortOrder: 4,
            },
            {
                question: 'Konuşma veya video verisi toplamısınız?',
                description: 'Uygulamanız sesli görüşme veya video kaydı yapıyor mu?',
                type: 'BOOLEAN',
                required: true,
                sortOrder: 5,
            },
            {
                question: 'Ödeme bilgisi toplamısınız?',
                description: 'Uygulamanız kredi kartı veya diğer ödeme bilgileri topluyor mu?',
                type: 'BOOLEAN',
                required: true,
                sortOrder: 6,
            },
            {
                question: 'Sosyal medya entegrasyonu var mı?',
                description: 'Uygulamanız sosyal medya platformlarıyla entegre mi? (Facebook, Google, vb.)',
                type: 'TEXT',
                required: false,
                sortOrder: 7,
            },
            {
                question: 'Üçüncü taraf hizmetleri kullanıyormusunuz?',
                description: 'Uygulamanız harici API veya hizmetler (Analytics, Firebase, vb.) kullanıyor mu?',
                type: 'TEXTAREA',
                required: false,
                sortOrder: 8,
            },
        ];

        for (const q of questions) {
            await pool.query(
                `INSERT INTO questions (id, question, description, type, required, options, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
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
