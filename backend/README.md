# Privacy Policy Generator - Backend

Node.js + Apollo GraphQL + PostgreSQL

## Başlangıç

### Gereksinimler
- Node.js >= 16
- PostgreSQL >= 12
- npm veya yarn

### Kurulum

1. Bağımlılıkları kur:
```bash
npm install
```

2. `.env` dosyasını düzenle ve veritabanı bilgilerini gir:
```bash
cp .env.example .env
```

3. Veritabanını kur:
```bash
npm run migrate
```

4. Sorulıyı seed'le:
```bash
npm run seed
```

5. Sunucuyu başlat:
```bash
npm run dev
```

## API Endpoints

### GraphQL
- **URL**: `http://localhost:4000/graphql`
- **Method**: POST
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (authenticated endpoints için)

### Temel Queries

#### Sorular Getir
```graphql
query {
  questions {
    id
    question
    type
    required
  }
}
```

#### Benim Dokümanlarım
```graphql
query {
  myDocuments {
    id
    appName
    status
    createdAt
  }
}
```

### Temel Mutations

#### Kayıt Ol
```graphql
mutation {
  register(email: "user@example.com", password: "password123", fullName: "John Doe") {
    id
    email
    status
  }
}
```

#### Giriş Yap
```graphql
mutation {
  login(email: "user@example.com", password: "password123") {
    token
    user {
      id
      email
      fullName
    }
  }
}
```

#### Cevapları Gönder
```graphql
mutation {
  submitAnswers(answers: [
    { questionId: "question-id-1", value: "My App" }
    { questionId: "question-id-2", value: "Web" }
  ]) 
}
```

#### Dokümanları Oluştur
```graphql
mutation {
  generateDocuments(
    appName: "My App"
    answers: [
      { questionId: "id1", value: "My App" }
      { questionId: "id2", value: "Web" }
    ]
  ) {
    id
    privacyPolicy
    termsOfService
    status
  }
}
```

## Admin Operations

### Onay Bekleyen Kullanıcılar
```graphql
query {
  pendingUsers {
    id
    email
    fullName
    createdAt
  }
}
```

### Kullanıcı Onayla
```graphql
mutation {
  approveUser(userId: "user-id") {
    id
    email
    status
  }
}
```

### Kullanıcı Reddet
```graphql
mutation {
  rejectUser(userId: "user-id") {
    id
    email
    status
  }
}
```

## Ortam Değişkenleri

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=privacy_policy_db
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Docker ile PostgreSQL

Yerel geliştirme için:

```bash
docker run --name postgres-privpolicy \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=privacy_policy_db \
  -p 5432:5432 \
  -d postgres:15
```

## Struktur

```
src/
├── models/        # Database models
├── resolvers/     # GraphQL resolvers
├── services/      # Business logic
├── middleware/    # Authentication middleware
├── utils/         # Helper functions
├── migrations/    # Database initialization
├── seeds/         # Seed data
└── server.js      # Apollo Server
```

## Notlar

- Token başlıkta `Authorization: Bearer <token>` formatında gönderilmelidir
- Admin işlemleri için `isAdmin` true olmalı
- Gemini API key'i gereklidir (`.env` dosyasına ekle)
- Türkçe metin için UTF-8 encoding kullan
