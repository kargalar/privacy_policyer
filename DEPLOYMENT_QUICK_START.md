# 🚀 QUICK START - DEPLOYMENT GUIDE

> Bu rehber, Backend'i Render'da, Database'i PostgreSQL olarak Render'da, ve Frontend'i Vercel'da yayınlamak için adım adım talimatlar içerir.

---

## 📌 ÖZET

| Bileşen | Platform | Durum |
|---------|----------|-------|
| **Backend (Node.js + GraphQL)** | Render | ✅ Hazır |
| **Database (PostgreSQL)** | Render | ✅ Hazır |
| **Frontend (React)** | Vercel | ✅ Hazır |
| **Otomatik Deployment** | GitHub | ✅ Hazır |

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### ADIM 1️⃣: Render'da PostgreSQL Database Oluştur

1. [render.com](https://render.com) → **Dashboard** → **New +**
2. **PostgreSQL** seçin
3. Bilgileri girin:
   ```
   Name: privacy-policy-db
   Database: privacy_policy
   User: postgres
   Password: [Güçlü bir şifre yazın]
   Region: Germany (EU) veya Singapore (if closer)
   Plan: Free
   ```
4. **Create Database** tıklayın
5. ⏳ 5-10 dakika bekleyin (Database kurulacak)
6. Database sayfasında **Internal Database URL** kopyalayın:
   ```
   postgresql://postgres:PASSWORD@internal-dpg-xxxxx.render.com:5432/privacy_policy
   ```

---

### ADIM 2️⃣: Render'da Backend Service Oluştur

1. Render Dashboard → **New +** → **Web Service**
2. GitHub reponuzu seçin ve authorize edin
3. Ayarlar:
   ```
   Name: privacy-policy-backend
   Environment: Node
   Build Command: npm install && npx prisma generate && npx prisma migrate deploy
   Start Command: npm start
   Root Directory: backend
   Plan: Free
   ```
4. **Advanced** sekmesine gidin ve aşağıdaki environment variables ekleyin:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres:PASSWORD@internal-dpg-xxxxx.render.com:5432/privacy_policy` |
| `JWT_SECRET` | Rastgele güçlü şifre (min 32 karakter) |
| `GOOGLE_API_KEY` | Google Generative AI API Key |
| `FRONTEND_URL` | `https://your-frontend-url.vercel.app` |

5. **Create Web Service** tıklayın
6. ⏳ Build izlenin (Logs sekmesinde)
7. ✅ Build başarılı ve "Live" durumunda olduğunu kontrol edin

---

### ADIM 3️⃣: Frontend'i Vercel'de Deploy Et

1. [vercel.com](https://vercel.com) → **Import Project**
2. GitHub reponuzu seçin
3. Ayarlar:
   ```
   Framework: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   ```
4. **Environment Variables** sekmesinde ekleyin:

| Key | Value |
|-----|-------|
| `REACT_APP_GRAPHQL_ENDPOINT` | `https://privacy-policy-backend.onrender.com/graphql` |

5. **Deploy** tıklayın
6. ⏳ Deploy tamamlanana kadar bekleyin
7. ✅ Deployment başarılı olduğunu kontrol edin

---

## ✅ KONTROL ET

### Backend'i Test Et
```bash
# GraphQL Endpoint'e erişim test et
curl https://privacy-policy-backend.onrender.com/graphql

# Veya browser'da aç
https://privacy-policy-backend.onrender.com/graphql
```

### Frontend'i Test Et
```bash
# Vercel URL'sini ziyaret et
https://your-app.vercel.app
```

### Database Bağlantısını Test Et
1. Render → Database → Connect
2. psql komut satırından veya pgAdmin'den bağlan
3. Tables'ı kontrol et:
   ```sql
   \dt
   SELECT COUNT(*) FROM users;
   ```

---

## 🔄 PRODUCTION DEPLOYMENT WORKFLOW

### Yeni Feature Ekle:

```bash
# 1. Local'da geliştir
git checkout -b feature/new-feature

# 2. Test et
cd backend && npm run dev
# (başka terminal'de)
cd frontend && npm start

# 3. Commit ve push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 4. GitHub'da Pull Request oluştur
# → PR review → Merge to main

# 5. Otomatik deployment başlar:
#    - Render: Backend build ve deploy (2-5 dakika)
#    - Vercel: Frontend build ve deploy (1-2 dakika)
```

---

## 🆘 SORUN ÇÖZME

### ❌ "Database Connection Error"
```
Çözüm:
1. Render Dashboard → Database → Logs
2. Status: "Available" mı diye kontrol et
3. DATABASE_URL doğru mu diye kontrol et
4. Network güvenlik ayarlarını kontrol et
```

### ❌ "CORS Error"
```
Çözüm:
1. FRONTEND_URL ortam değişkenini kontrol et
2. Backend çalıştığını kontrol et
3. Browser console'da error mesajını oku
4. GraphQL endpoint erişilebilir mi kontrol et
```

### ❌ "Build Failed"
```
Çözüm:
1. Render → Logs veya Vercel → Logs'u oku
2. Error message'i ara
3. Local'da npm install && npm run build test et
4. package.json dependencies'i kontrol et
```

### ❌ "Prisma Migration Error"
```
Çözüm:
1. schema.prisma dosyasını kontrol et
2. Migration files'ı kontrol et
3. Local'da prisma migrate dev test et
4. schema.prisma'da hata varsa düzelt ve push et
```

---

## 📊 ENVIRONMENT VARIABLES REFERENCE

### Backend (.env.production)
```env
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@internal-dpg-xxxxx.render.com:5432/privacy_policy

# Server
NODE_ENV=production
PORT=10000

# Security
JWT_SECRET=your_very_secure_random_string_here_min_32_chars

# API Keys
GOOGLE_API_KEY=your_google_api_key_here

# Frontend URL (CORS)
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env.production)
```env
REACT_APP_GRAPHQL_ENDPOINT=https://privacy-policy-backend.onrender.com/graphql
```

---

## 📞 USEFUL LINKS

| Resource | Link |
|----------|------|
| Render Docs | https://docs.render.com |
| Vercel Docs | https://vercel.com/docs |
| Prisma Deploy | https://www.prisma.io/docs/guides/deployment |
| Apollo GraphQL | https://www.apollographql.com/docs |
| Render Status | https://render.com/status |
| Vercel Status | https://www.vercelstatus.com |

---

## 📈 MONITORING

### Render Backend Logs
```
Dashboard → Service → Logs
```

### Vercel Frontend Logs
```
Dashboard → Deployments → [Latest] → Logs
```

### Database Monitoring
```
Render Dashboard → Database → Logs
```

---

## 🎯 FINAL CHECKLIST

- [ ] Render PostgreSQL Database oluşturuldu
- [ ] Database URL kopyalandı
- [ ] Backend Service oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Backend build başarılı
- [ ] Backend Live durumunda
- [ ] Frontend Vercel'de import edildi
- [ ] Frontend env var ayarlandı
- [ ] Frontend deploy başarılı
- [ ] Frontend URL erişilebilir
- [ ] Backend GraphQL endpoint test edildi
- [ ] Frontend → Backend API çağrıları çalışıyor
- [ ] Database migrations çalışmış
- [ ] Authentication çalışıyor

✅ **Tüm kontroller tamamlandı? Deployment başarılı! 🎉**

---

## 🔗 DEPLOYMENT URLS

```
Backend GraphQL:
https://privacy-policy-backend.onrender.com/graphql

Frontend:
https://your-app.vercel.app

Database:
postgresql://postgres:PASSWORD@internal-dpg-xxxxx.render.com:5432/privacy_policy

Public API:
https://privacy-policy-backend.onrender.com/public/{username}/{appName}/privacypolicy
https://privacy-policy-backend.onrender.com/public/{username}/{appName}/termsofservice
```

---

**Last Updated:** November 15, 2024
**Status:** ✅ Production Ready
