# Privacy Policy & Terms of Service Generator - Roadmap

## Proje Özeti
Kullanıcıların kendi uygulamaları için otomatik olarak Privacy Policy ve Terms of Service oluşturabilecekleri bir web uygulaması.

---

## 📋 Yapılacaklar (TODO)

### ✅ Phase 1: Proje Setup
- [ ] Backend ve Frontend projesi oluştur
- [ ] PostgreSQL veritabanını konfigüre et
- [ ] Apollo Server setup
- [ ] React projesi kurulumu

### ✅ Phase 2: Kimlik Doğrulama Sistemi
- [ ] User modeli ve tablo oluştur (PostgreSQL)
- [ ] GraphQL mutation: `registerUser` (kayıt)
- [ ] GraphQL mutation: `loginUser` (giriş)
- [ ] Admin onay sistemi (user status: PENDING/APPROVED/REJECTED)
- [ ] JWT token authentication
- [ ] React Login/Register sayfaları
- [ ] Admin Dashboard (kullanıcı yönetimi)

### ✅ Phase 3: Anket/Soru Sistemi
- [ ] Question modeli oluştur (PostgreSQL)
- [ ] Temel sorular ekle:
  - [ ] Uygulama adı
  - [ ] Uygulama türü (Web, Mobile, Desktop vb.)
  - [ ] E-posta adresi
  - [ ] Telefon numarası topla mı?
  - [ ] Konuşma verisi topla mı?
  - [ ] Ödeme bilgisi topla mı?
  - [ ] Sosyal medya entegrasyonu var mı?
  - [ ] Üçüncü taraf hizmetleri var mı?
- [ ] GraphQL query: `getQuestions`
- [ ] GraphQL mutation: `submitAnswers`
- [ ] React Soru Formu sayfası

### ✅ Phase 4: Gemini API Entegrasyonu
- [ ] Gemini API key yapılandırması
- [ ] Prompt templates oluştur (Privacy Policy ve Terms of Service için)
- [ ] GraphQL mutation: `generateDocuments` (Gemini API'ye istek)
- [ ] Response handling ve caching
- [ ] Error handling

### ✅ Phase 5: Doküman Oluşturma ve Onay
- [ ] Document modeli (PostgreSQL)
- [ ] GraphQL mutation: `approveDocument` (kullanıcı onayı)
- [ ] React Preview sayfası (oluşturulan doküman göster)
- [ ] Edit seçeneği (soruları yeniden cevapla)
- [ ] Export PDF/HTML seçeneği

### ✅ Phase 6: Doküman Gösterimi
- [ ] Privacy Policy sayfası template
- [ ] Terms of Service sayfası template
- [ ] Dinamik sayfa oluştur (kullanıcı dokümanları göster)
- [ ] URL struktur: `/privacy-policy/:userId` ve `/terms-of-service/:userId`

### ✅ Phase 7: Testing & Deployment
- [ ] Unit testler yaz
- [ ] Integration testler
- [ ] Security audit
- [ ] Production build
- [ ] Deployment

---

## 🗂️ Proje Yapısı

```
privacy_policyer/
├── backend/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── resolvers/       # GraphQL resolvers
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── middleware/      # Auth middleware
│   │   ├── schema.graphql   # GraphQL schema
│   │   └── server.js        # Apollo Server
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Helper functions
│   │   ├── queries/         # GraphQL queries
│   │   ├── mutations/       # GraphQL mutations
│   │   ├── context/         # React context
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── docker-compose.yml       # PostgreSQL for dev
└── ROADMAP.md              # Bu dosya
```

---

## 🔐 Kimlik Doğrulama Akışı

1. Kullanıcı kayıt formu doldurur
2. Admin panelinde onay bekler (status: PENDING)
3. Admin onayladıktan sonra (status: APPROVED)
4. Kullanıcı giriş yapabiliyor ve formu doldurabilir

---

## 🤖 Gemini API Prompt Yapısı

### Privacy Policy Prompt Template:
```
Aşağıdaki bilgilere göre bir Privacy Policy oluştur:
- Uygulama Adı: {appName}
- Uygulama Türü: {appType}
- E-posta Topla mı: {collectsEmail}
- Telefon Topla mı: {collectsPhone}
- Ödeme Bilgisi Topla mı: {collectsPayment}
- Sosyal Medya: {socialMedia}
- Üçüncü Taraf Hizmetleri: {thirdParty}

Çıktı: Profesyonel, yasal ve kapsamlı bir Privacy Policy oluştur.
```

### Terms of Service Prompt Template:
```
Aşağıdaki bilgilere göre Terms of Service oluştur:
- Uygulama Adı: {appName}
- Uygulama Türü: {appType}
- Diğer Veriler: [privacy policy'den yararlan]

Çıktı: Profesyonel, yasal ve kapsamlı bir Terms of Service oluştur.
```

---

## 📊 GraphQL Schema (Temel)

```graphql
type User {
  id: ID!
  email: String!
  password: String!
  status: UserStatus!  # PENDING, APPROVED, REJECTED
  createdAt: DateTime!
}

type Question {
  id: ID!
  question: String!
  type: String!  # text, boolean, select
  required: Boolean!
}

type Answer {
  id: ID!
  userId: ID!
  questionId: ID!
  value: String!
}

type Document {
  id: ID!
  userId: ID!
  appName: String!
  privacyPolicy: String!
  termsOfService: String!
  status: DocumentStatus!  # DRAFT, APPROVED, PUBLISHED
  createdAt: DateTime!
}

enum UserStatus {
  PENDING
  APPROVED
  REJECTED
}

enum DocumentStatus {
  DRAFT
  APPROVED
  PUBLISHED
}
```

---

## 🚀 Başlangıç Adımları

1. Backend projesi oluştur
2. Frontend projesi oluştur
3. PostgreSQL ve Docker setup
4. Temel auth sistemi kur
5. Gemini API entegrasyonu yap
6. Tamamlama

---

## 📝 Notlar

- **Security**: JWT tokens kullan, password hash (bcrypt)
- **Rate Limiting**: Gemini API çağrılarına limit koy
- **Caching**: Aynı soruların cevapları cache'le
- **Error Handling**: Tüm API errors'lar düzgün handle et
- **Responsive Design**: Mobile friendly UI

---

**Last Updated**: 13 Kasım 2025
