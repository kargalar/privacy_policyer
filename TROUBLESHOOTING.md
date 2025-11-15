# Sık Sorunlar ve Çözümleri (FAQ)

## 🔴 SORUN: "Connection refused" / "Cannot connect to database"

### Nedeni
Database connection string yanlış veya database çalışmıyor.

### Çözüm
1. Render Dashboard → PostgreSQL Database'e gidin
2. Status "Available" mı? (yeşil mi?)
3. Database URL'sini kopyalayın ve kontrol edin:
   ```
   postgresql://postgres:PASSWORD@internal-dpg-xxxxx.render.com:5432/privacy_policy
   ```
4. Backend environment variables'ında bu URL'yi kullanın
5. Render → Web Service → Environment'da DATABASE_URL doğru mu diye kontrol edin

---

## 🔴 SORUN: "CORS Error" / "No 'Access-Control-Allow-Origin' header"

### Nedeni
Frontend'den Backend'e API çağrısı yapılırken CORS politikası blokluyor.

### Çözüm
1. Backend'in `src/server.js` içinde CORS ayarını kontrol et:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true,
   }));
   ```
2. Render'da FRONTEND_URL ortam değişkenini ayarla:
   - Render → Backend Service → Environment
   - `FRONTEND_URL` = `https://your-app.vercel.app`
3. Frontend'deki GraphQL endpoint doğru mu:
   - Vercel → Environment Variables
   - `REACT_APP_GRAPHQL_ENDPOINT` = `https://privacy-policy-backend.onrender.com/graphql`

---

## 🔴 SORUN: "404 Not Found" (GraphQL endpoint)

### Nedeni
Backend URL yanlış veya backend çalışmıyor.

### Çözüm
1. Backend health check:
   ```bash
   curl https://privacy-policy-backend.onrender.com/health
   ```
2. GraphQL endpoint:
   ```bash
   curl https://privacy-policy-backend.onrender.com/graphql
   ```
3. Render → Service → Logs'ta error var mı kontrol et
4. Build başarılı mı kontrol et (Status: "Live" mi?)

---

## 🔴 SORUN: "Build Failed" (Render)

### Nedeni
Genellikle dependency sorunu veya build script hatası.

### Çözüm
1. Render → Service → Logs'ta tam error message'ı oku
2. Common errors:
   ```
   "npm ERR!" → package.json dependency sorunu
   "prisma:" → Prisma generate hatası
   "ENOENT" → Dosya bulunamadı hatası
   ```
3. Local'da test et:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run build
   ```
4. Hata varsa fix et ve push et

---

## 🔴 SORUN: "Migration Failed"

### Nedeni
Database schema migration'u başarısız oldu.

### Çözüm
1. `backend/prisma/schema.prisma` syntax'ını kontrol et
2. Migration files'ını kontrol et: `backend/prisma/migrations/`
3. Local'da test et:
   ```bash
   cd backend
   npx prisma migrate dev --name test_migration
   ```
4. Hata varsa schema'yı fix et
5. Push et - Render otomatik migrate yapacak

---

## 🔴 SORUN: "Service spinning down" / "Slow response"

### Nedeni
Render free tier 15 dakika inaktiviteden sonra uyku moduna geçer.

### Çözüm (Kısa vadeli)
- Service uyandığı ilk request 30-60 saniye alır
- Normal bir şey, expected behavior

### Çözüm (Uzun vadeli)
- Render Starter plan'a upgrade et ($7/month)
- Always-on olur
- Performans 2x+ hızlanır

---

## 🔴 SORUN: "Vercel Build Failed"

### Nedeni
Frontend build sırasında hata.

### Çözüm
1. Vercel → Deployments → [latest deployment] → Logs
2. Error message'ı oku
3. Local'da test et:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
4. Common issues:
   - `REACT_APP_GRAPHQL_ENDPOINT` undefined
   - CSS/Tailwind build hatası
   - Import hatası

---

## 🔴 SORUN: "Prisma client out of sync"

### Nedeni
Prisma client generate edilmedi veya eski versiyon.

### Çözüm
1. Local'da:
   ```bash
   cd backend
   npx prisma generate
   ```
2. Git'e push et
3. Render otomatik olarak generate edecek

---

## 🔴 SORUN: "Environment variables not loaded"

### Nedeni
Environment variable düzgün set edilmedi.

### Çözüm

**Render için:**
1. Dashboard → Service → Settings → Environment
2. Variable add et
3. Build restart et (Deploy → Trigger deploy)

**Vercel için:**
1. Dashboard → Project Settings → Environment Variables
2. Variable add et
3. New deployment yapan bir push et

---

## 🟡 SORUN: "Slow queries"

### Nedeni
Database indexleri eksik veya query optimize olmamış.

### Çözüm
1. PostgreSQL logs'unu kontrol et
2. Slow query log'ları aç
3. Indexes add et
4. Query optimize et
5. N+1 problem'ı kontrol et (Apollo DataLoader kullan)

---

## 🟡 SORUN: "High memory usage"

### Nedeni
Memory leak veya Node process çok az RAM'e sahip.

### Çözüm
1. Free tier → 512MB RAM (limited)
2. Starter plan'a upgrade et (1GB+)
3. Node process optimize et
4. Connection pooling kullan

---

## ✅ SORUN: "Deployment başarılı ama site yavaş"

### Optimizasyon Önerileri
1. Frontend:
   - Build optimize et
   - Image compression
   - Lazy loading

2. Backend:
   - Database queries optimize et
   - Caching add et (Redis)
   - N+1 sorunları fix et

3. Database:
   - Indexes kontrol et
   - Query plans analiz et
   - Starter plan'a upgrade et

---

## 🔍 DEBUG COMMANDS

### Backend logs check
```bash
# Render logs live stream
curl -N https://api.render.com/v1/services/YOUR_SERVICE_ID/logs
```

### Database connection test
```bash
# psql ile connect test (kendi makinanda)
psql "postgresql://user:pass@internal-dpg-xxxxx.render.com:5432/privacy_policy"

# veya connection string test
node -e "require('pg').Client('postgresql://...').connect()"
```

### GraphQL endpoint test
```bash
# introspection query
curl -X POST https://backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```

### CORS test
```bash
# CORS headers check
curl -I -X OPTIONS https://backend.onrender.com/graphql
```

---

## 📞 GET HELP

Eğer sorun çözemezseniz:

1. **Error Message'ı Google'da ara**: 9/10 başkası da yaşamıştır
2. **Logs'u tam oku**: Genellikle cevap orada
3. **Local'da reproduce et**: Problem izole et
4. **Official docs'ı oku**:
   - Render: https://docs.render.com
   - Vercel: https://vercel.com/docs
   - Prisma: https://www.prisma.io/docs

---

## 💡 PRO TIPS

1. **Deployment öncesi**: Local'da her şey çalışıyor mu kontrol et
2. **Build hataları**: Genellikle `npm install` hatası
3. **Runtime hataları**: Genellikle environment variable sorunu
4. **Slow performance**: Genellikle database sorunu
5. **CORS hataları**: FRONTEND_URL kontrol et
6. **404 hatası**: Endpoint URL doğru mu kontrol et

---

**Last Updated:** November 15, 2024
