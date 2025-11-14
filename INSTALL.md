# Privacy Policy Generator - Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

- **Node.js** (v18 veya daha yeni)
- **PostgreSQL** (14 veya daha yeni)
- **npm** veya **yarn**

### Adım 1: PostgreSQL Kurulumu

1. [PostgreSQL indir](https://www.postgresql.org/download/)
2. Kurulum sırasında password belirle (örn: `postgres`)
3. Kurulum sonrası PostgreSQL komut satırını aç:

```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanını oluştur
CREATE DATABASE privacy_policy_db;

# Çıkış yap
\q
```

### Adım 2: Backend Kurulumu

1. Backend klasörüne gidin:
```bash
cd backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Ortam değişkenlerini ayarlayın:
```bash
# .env dosyasını oluştur
copy .env.example .env
```

4. `.env` dosyasını düzenleyin ve aşağıdaki değerleri güncelleyin:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/privacy_policy_db"
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-secret-key-change-in-production
```

5. Veritabanını ayarlayın:
```bash
npx prisma migrate dev --name init
```

6. Soruları seed'leyin:
```bash
npm run seed
```

7. Backend'i başlatın (geliştirme modu - canlı güncellemeler):
```bash
npm run dev
```

Backend http://localhost:4000/graphql adresinde çalışacaktır.

### Adım 3: Frontend Kurulumu

Yeni bir terminal açın ve:

1. Frontend klasörüne gidin:
```bash
cd frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Ortam değişkenlerini ayarlayın:
```bash
# .env dosyasını oluştur
copy .env.example .env
```

4. Frontend'i başlatın (geliştirme modu - canlı güncellemeler):
```bash
npm start
```

Frontend http://localhost:3000 adresinde açılacaktır.

## 📋 Kurulum Sonrası Yapılacaklar

### 1. Gemini API Key Alma

1. https://ai.google.dev adresine gidin
2. "Get API Key" butonuna tıklayın
3. Google hesabıyla giriş yapın
4. API key'i kopyalayın
5. Backend `.env` dosyasında `GEMINI_API_KEY` güncelleyin

### 2. Admin Hesabı

Database'de varsayılan admin:
- Email: `admin@privacypolicy.com`
- Status: APPROVED
- isAdmin: TRUE

### 3. Test Kullanıcısı Oluştur

1. Frontend'de http://localhost:3000 açın
2. "Kayıt Ol" butonuna tıklayın
3. Bilgilerinizi girin
4. Admin paneline gidin (http://localhost:4000 admin hesabıyla)
5. Kullanıcıyı onaylayın

## 🔧 Troubleshooting

### Port zaten kullanılıyor

Windows'ta:
```powershell
# 4000 portunu kullanan process'i bul
netstat -ano | findstr :4000

# Process'i sonlandır (PID'yi kullan)
taskkill /PID <PID> /F
```

Linux/Mac'ta:
```bash
# 4000 portunu kullanan process'i bul ve sonlandır
lsof -ti:4000 | xargs kill -9
```

### Database bağlantısı başarısız

1. PostgreSQL servisi çalışıyor mu kontrol edin
2. Connection string'i `.env` dosyasında kontrol edin
3. Veritabanı var mı kontrol edin: `psql -U postgres -l`

### CORS hatası

Backend `.env` dosyasında `FRONTEND_URL` kontrolü yapın:
```env
FRONTEND_URL=http://localhost:3000
```

### Gemini API hatası

1. API key'i `.env` dosyasına ekleyin
2. API key'in geçerli olduğunu kontrol edin
3. API limitine ulaşıp ulaşmadığını kontrol edin

## 📚 Kullanılan Teknolojiler

### Backend
- Node.js
- Apollo Server
- GraphQL
- PostgreSQL
- Express
- Gemini API
- JWT Authentication

### Frontend
- React 18
- Apollo Client
- React Router
- Tailwind CSS
- Lucide React Icons

## 📁 Proje Yapısı

```
privacy_policyer/
├── backend/
│   ├── src/
│   │   ├── migrations/     # DB setup
│   │   ├── models/         # Database models
│   │   ├── resolvers/      # GraphQL resolvers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   ├── seeds/          # Initial data
│   │   ├── utils/          # Utilities
│   │   ├── schema.graphql.js
│   │   └── server.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context
│   │   ├── graphql/        # GraphQL queries
│   │   ├── utils/          # Utilities
│   │   ├── hooks/          # Custom hooks
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── README.md
├── docker-compose.yml
└── ROADMAP.md
```

## 🧪 Testing

### GraphQL Queries Test

Apollo Studio'ya gidin: http://localhost:4000/graphql

```graphql
# Test: Tüm Soruları Getir
query {
  questions {
    id
    question
    type
  }
}
```

### Admin Panel Test

Admin hesabı ile giriş yapın ve pending kullanıcıları görün.

## 📝 Ortam Değişkenleri

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=privacy_policy_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-api-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
REACT_APP_API_URL=http://localhost:4000
```

## 🔐 Security Notes

- Production'da JWT_SECRET'ı değiştirin
- PostgreSQL şifresini güçlü yapın
- HTTPS kullanın
- API rate limiting ekleyin
- Input validation yapın

## 📞 Destek

Sorunlar için ROADMAP.md dosyasını kontrol edin.

---

**Last Updated**: 13 Kasım 2025
