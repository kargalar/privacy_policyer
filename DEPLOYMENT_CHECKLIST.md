# Render ve Vercel Deployment Kontrol Listesi

## 📋 RENDER DATABASE KURULUMU

- [ ] Render.com hesabı açıldı
- [ ] PostgreSQL Database oluşturuldu
- [ ] Database adı: `privacy-policy-db`
- [ ] Internal Database URL kopyalandı
- [ ] External Database URL kopyalandı
- [ ] Database Status: **Available** (yeşil)

## 🚀 RENDER BACKEND DEPLOYMENT

### Repository Bağlantısı
- [ ] GitHub reposu Render'a bağlandı
- [ ] Branch: `main` seçildi
- [ ] Root Directory: `backend` girildi

### Build ve Start Commands
- [ ] Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
- [ ] Start Command: `npm start`

### Environment Variables
- [ ] `DATABASE_URL` = PostgreSQL URL (Internal)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = 10000 (Render'ın atanması)
- [ ] `JWT_SECRET` = Güçlü şifre
- [ ] `GOOGLE_API_KEY` = Geçerli API key
- [ ] `FRONTEND_URL` = Vercel frontend URL

### Build ve Deploy Status
- [ ] İlk build başarılı
- [ ] Logs'ta hata yok
- [ ] Service Running durumunda
- [ ] Health check pass ✓

## 🎨 VERCEL FRONTEND DEPLOYMENT

### Repository Bağlantısı
- [ ] GitHub reposu Vercel'e bağlandı
- [ ] Project adı: `privacy-policy-frontend`

### Build Ayarları
- [ ] Framework: Create React App
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `build`

### Environment Variables
- [ ] `REACT_APP_GRAPHQL_ENDPOINT` = Backend GraphQL URL

### Deployment Status
- [ ] Production deployment başarılı
- [ ] Domain assigned
- [ ] SSL certificate aktif

## 🔗 BAĞLANTILARI TEST ET

### Frontend Kontrol
- [ ] Frontend yükleniyor
- [ ] Sayfalar render ediliyor
- [ ] Routing çalışıyor

### Backend Kontrol
- [ ] GraphQL endpoint erişilebilir
- [ ] Database bağlantısı çalışıyor
- [ ] Migrations başarılı

### CORS Kontrol
- [ ] Frontend → Backend API çağrıları başarılı
- [ ] Token gönderimi çalışıyor
- [ ] Hata mesajı yok

## 🔄 CONTINUOUS DEPLOYMENT

### Auto Deploy Ayarları
- [ ] Render: `main` branch'e push → auto deploy
- [ ] Vercel: `main` branch'e push → auto deploy

### Git Workflow
- [ ] Backend değişikliği → push → Render auto deploy
- [ ] Frontend değişikliği → push → Vercel auto deploy
- [ ] Database migration → push → Render auto migrate

## ⚠️ OLASI SORUNLAR

### Build Hatası
- [ ] `backend/package.json` postinstall script kontrol et
- [ ] Prisma generate adımı başarılı mı?
- [ ] Dependencies versiyonları uyumlu mu?

### Database Hatası
- [ ] DATABASE_URL formatı doğru mu?
- [ ] Migration dosyaları yollandı mı?
- [ ] Connection limit aşıldı mı?

### CORS Hatası
- [ ] FRONTEND_URL ortam değişkeni doğru mu?
- [ ] Backend'deki cors options güncellenmiş mi?

### GraphQL Hatası
- [ ] GraphQL endpoint URL doğru mu?
- [ ] Authorization header gönderiliyor mu?
- [ ] Schema generate edilmiş mi?

## 📞 DEBUGGING

### Render Logs
1. Dashboard → Service → Logs
2. Error message kontrol et
3. Build process trance et

### Vercel Logs
1. Dashboard → Deployments → [deployment] → Logs
2. Build error kontrol et
3. Function logs kontrol et

### Database Check
1. Render Database → Connect
2. psql ile bağlan veya pgAdmin kullan
3. Tables ve migrations kontrol et

## ✅ PRODUCTION READY

- [ ] Tüm ortam değişkenleri ayarlandı
- [ ] HTTPS/SSL etkin
- [ ] Database backups ayarlandı
- [ ] Error monitoring (Sentry vb) ayarlandı
- [ ] Performance monitoring ayarlandı
- [ ] Security headers ayarlandı
- [ ] Rate limiting ayarlandı
- [ ] Logging ayarlandı

---

## 📝 NOTLAR

Deployment tarih: _______________
Yapılan değişiklikler: _______________
Sorunlar: _______________
Çözüm: _______________
