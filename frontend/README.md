# Privacy Policy Generator - Frontend

React + Apollo Client + Tailwind CSS

## Başlangıç

### Gereksinimler
- Node.js >= 16
- npm veya yarn

### Kurulum

1. Bağımlılıkları kur:
```bash
npm install
```

2. `.env` dosyasını düzenle:
```bash
REACT_APP_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
REACT_APP_API_URL=http://localhost:4000
```

3. Development sunucusunu başlat:
```bash
npm start
```

Uygulama `http://localhost:3000` adresinde açılacak.

## Sayılar

### Umumi Sayfalar
- `/login` - Giriş Sayfası
- `/register` - Kayıt Sayfası

### Kullanıcı Sayfaları
- `/dashboard` - Dashboard
- `/create` - Yeni Doküman Oluştur
- `/documents` - Dokümanlarım
- `/documents/:id` - Doküman Detayları

### Admin Sayfaları
- `/admin` - Admin Paneli

## Proje Yapısı

```
src/
├── components/        # Reusable components
├── pages/            # Page components
├── context/          # React Context
├── graphql/          # GraphQL queries/mutations
├── utils/            # Helper functions
├── hooks/            # Custom hooks
└── App.js            # Main App component
```

## Teknolojiler

- **React** - UI Framework
- **Apollo Client** - GraphQL Client
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Özellikler

### Kimlik Doğrulama
- Kayıt ve Giriş
- Token-based authentication (JWT)
- Admin onay sistemi

### Doküman Oluşturma
- Soru formunu doldurma
- Gemini AI ile otomatik doküman oluşturma
- Privacy Policy ve Terms of Service şablonları

### Doküman Yönetimi
- Dokümanları görüntüleme ve düzenleme
- Dokümanları onaylama ve yayınlama
- PDF/TXT indir

### Admin Paneli
- Onay bekleyen kullanıcıları görüntüleme
- Kullanıcıları onaylama/reddetme

## Environment Variables

```env
REACT_APP_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
REACT_APP_API_URL=http://localhost:4000
```

## Build

Production build oluştur:

```bash
npm run build
```

## Notlar

- CORS problemi varsa, backend'de FRONTEND_URL'yi kontrol et
- Apollo Client caching otomatik yapılır
- Token localStorage'da saklanır (üretim için daha güvenli seçenek kullan)
