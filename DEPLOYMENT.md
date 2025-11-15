# Render ve Vercel Deployment Rehberi

## Genel Kurulum

Projeniz aşağıdaki yapıya sahiptir:
- **Backend**: Node.js + Express + GraphQL + PostgreSQL (Render'da)
- **Database**: PostgreSQL (Render'da)
- **Frontend**: React (Vercel'de)

---

## 1. RENDER'DA DATABASE VE BACKEND DEPLOYMENT

### 1.1 PostgreSQL Database Oluşturma

1. [Render.com](https://render.com) hesabı açın
2. Dashboard'a gidin → **New +** → **PostgreSQL**
3. Ayarlar:
   - **Name**: `privacy-policy-db`
   - **Database**: `privacy_policy`
   - **User**: `postgres` (veya başka bir ad)
   - **Password**: Güçlü bir şifre oluşturun
   - **Region**: Türkiye'ye yakın bölge seçin (EU - Frankfurt vb)
   - **Plan**: Free (başlangıç için)
4. **Create Database** butonuna tıklayın
5. Database oluşturulduktan sonra, **Internal Database URL** ve **External Database URL** kopyalayın

### 1.2 Backend Servisi Oluşturma

1. Render Dashboard → **New +** → **Web Service**
2. GitHub reponuzu bağlayın:
   - Repository'yi seçin
   - **Branch**: `main`
   - **Runtime**: `Node`
3. Ayarlar:
   - **Name**: `privacy-policy-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. **Advanced** sekmesinde ortam değişkenleri ekleyin:

```
DATABASE_URL = postgresql://user:password@internal-database-url:5432/privacy_policy
NODE_ENV = production
PORT = 10000
GOOGLE_API_KEY = YOUR_GOOGLE_API_KEY
JWT_SECRET = YOUR_SECURE_JWT_SECRET
```

5. **Create Web Service** butonuna tıklayın

### 1.3 Backend için Render Yapılandırması

Backend root'unda `.env.production` dosyası oluşturun:

```env
DATABASE_URL=postgresql://user:password@internal-database-url:5432/privacy_policy
NODE_ENV=production
PORT=10000
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-frontend.vercel.app
```

### 1.4 Backend Dosya Düzenlemeleri

**backend/package.json** içinde build script ekleyin:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "seed": "node src/seeds/questions.js",
  "migrate": "node src/migrations/init.js",
  "build": "npx prisma generate",
  "postinstall": "npx prisma generate"
}
```

**backend/src/server.js** içinde production hazırlanması:

```javascript
// CORS güvenliğini güncelleyin
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true
};

app.use(cors(corsOptions));
```

---

## 2. VERCEL'DA FRONTEND DEPLOYMENT

### 2.1 Frontend Hazırlığı

1. **frontend/.env.production** dosyası oluşturun:

```env
REACT_APP_GRAPHQL_ENDPOINT=https://your-backend.onrender.com/graphql
```

2. **frontend/public/_redirects** dosyası oluşturun (SPA routing için):

```
/* /index.html 200
```

Veya **frontend/vercel.json** oluşturun:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "env": {
    "REACT_APP_GRAPHQL_ENDPOINT": "@graphql_endpoint"
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2.2 Vercel'de Deploy Etme

1. [Vercel.com](https://vercel.com) hesabı açın
2. **Import Project** → GitHub reponuzu seçin
3. Ayarlar:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Environment Variables (Vercel Dashboard):
   ```
   REACT_APP_GRAPHQL_ENDPOINT = https://your-backend.onrender.com/graphql
   ```
5. **Deploy** butonuna tıklayın

---

## 3. ENVIRONMENT VARIABLES ÖZETI

### Backend (Render)

| Variable | Değer | Açıklama |
|----------|-------|---------|
| `DATABASE_URL` | PostgreSQL URL | Render Database'den kopyalayın |
| `NODE_ENV` | `production` | Production modu |
| `PORT` | `10000` | Render'ın atadığı port |
| `GOOGLE_API_KEY` | API Key | Google Generative AI API |
| `JWT_SECRET` | Şifre | Token imzalama için |
| `FRONTEND_URL` | Vercel Frontend URL | CORS güvenliği |

### Frontend (Vercel)

| Variable | Değer |
|----------|-------|
| `REACT_APP_GRAPHQL_ENDPOINT` | Backend GraphQL URL |

---

## 4. GİT PUSH VE AUTOMATIC DEPLOYMENT

Her repository'ye push ettiğinizde:
- **Render**: Otomatik Backend build ve deploy
- **Vercel**: Otomatik Frontend build ve deploy

```bash
# Backend güncellemesi
cd backend
git add .
git commit -m "Backend updates"
git push

# Frontend güncellemesi
cd frontend
git add .
git commit -m "Frontend updates"
git push
```

---

## 5. RENDER'DA DATABASE BAĞLANTISI

### İlk Kez Veritabanı Kurulumu

Render Dashboard → PostgreSQL → Connect → Connection String kopyalayın

Kullanılan URL formatı:
```
postgresql://user:password@dpg-xxxxx.render.com:5432/privacy_policy
```

**Not**: `dpg-xxxxx.render.com` linki sadece Render sunucularından erişilebilir. Backend service'i otomatik olarak bunu kullanacaktır.

---

## 6. PRISMA MIGRATIONS

Build sırasında Render otomatik olarak çalıştırır:
```
npx prisma migrate deploy
```

Eğer manual migration gerekirse, Render Dashboard'da:
1. Service → Logs kısmından kontrol edin
2. Hata varsa, migration dosyasını düzeltip push edin

---

## 7. SORUN ÇÖZME

### Backend Hata Logs
```
Render → Service → Logs sekmesinde hataları görebilirsiniz
```

### Frontend Build Hataları
```
Vercel → Deployments → Hatayı görmek için tıklayın
```

### Database Bağlantı Hatası
```
1. DATABASE_URL'yi kontrol edin
2. Render Database Status'ü kontrol edin
3. Migrations başarılı mı diye kontrol edin
```

### CORS Hatası
```
Frontend'deki api çağrısında CORS hatası alıyorsanız:
1. backend/src/server.js CORS konfigürasyonunu kontrol edin
2. FRONTEND_URL ortam değişkenini doğru ayarlayın
```

---

## 8. FAYDALI LINKLER

- [Render Docs](https://docs.render.com)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server)

---

## 9. HIZLI KONTROL LİSTESİ

### Backend Deployment
- [ ] Render PostgreSQL Database oluşturuldu
- [ ] Backend Service oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Build Command doğru
- [ ] Start Command doğru
- [ ] Logs'ta hata yok

### Frontend Deployment
- [ ] Vercel'de import yapıldı
- [ ] Environment variables ayarlandı
- [ ] REACT_APP_GRAPHQL_ENDPOINT Backend URL'i işaret ediyor

### Bağlantı Testi
- [ ] Frontend'den Backend'e bağlantı çalışıyor
- [ ] GraphQL Endpoint çalışıyor
- [ ] Database bağlantısı çalışıyor
