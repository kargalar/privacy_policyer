#!/bin/bash

# Render ve Vercel Deployment Helper Script

echo "======================================"
echo "Privacy Policy App - Deployment Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Git
echo -e "${YELLOW}1. Git Status Kontrol Ediliyor...${NC}"
git status
echo ""

# Step 2: Environment Files
echo -e "${YELLOW}2. Environment Dosyaları Kontrol Ediliyor...${NC}"
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}   ⚠️  backend/.env dosyası bulunamadı. .env.example kopyalanıyor...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}   ✓ backend/.env oluşturuldu. Lütfen konfigürasyonu düzenleyin.${NC}"
fi

if [ ! -f frontend/.env.local ]; then
    echo -e "${YELLOW}   ⚠️  frontend/.env.local dosyası bulunamadı. .env.example kopyalanıyor...${NC}"
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}   ✓ frontend/.env.local oluşturuldu. Lütfen konfigürasyonu düzenleyin.${NC}"
fi
echo ""

# Step 3: Backend Build Check
echo -e "${YELLOW}3. Backend Bağımlılıkları Kontrol Ediliyor...${NC}"
cd backend
npm install
npx prisma generate
echo -e "${GREEN}   ✓ Backend hazır${NC}"
cd ..
echo ""

# Step 4: Frontend Build Check
echo -e "${YELLOW}4. Frontend Bağımlılıkları Kontrol Ediliyor...${NC}"
cd frontend
npm install
echo -e "${GREEN}   ✓ Frontend hazır${NC}"
cd ..
echo ""

# Step 5: Render Configuration
echo -e "${YELLOW}5. Render Configuration Kontrol Ediliyor...${NC}"
if [ -f backend/render.yaml ]; then
    echo -e "${GREEN}   ✓ render.yaml bulundu${NC}"
else
    echo -e "${YELLOW}   ⚠️  render.yaml dosyası bulunamadı${NC}"
fi
echo ""

# Step 6: Vercel Configuration
echo -e "${YELLOW}6. Vercel Configuration Kontrol Ediliyor...${NC}"
if [ -f frontend/vercel.json ]; then
    echo -e "${GREEN}   ✓ vercel.json bulundu${NC}"
else
    echo -e "${YELLOW}   ⚠️  vercel.json dosyası bulunamadı${NC}"
fi
echo ""

# Step 7: Summary
echo -e "${GREEN}======================================"
echo "DEPLOYMENT SETUP BAŞARILI"
echo "======================================${NC}"
echo ""
echo "SONRAKI ADIMLAR:"
echo "1. Render.com'da PostgreSQL Database oluşturun"
echo "2. Backend CORS ve ortam değişkenlerini güncelleyin"
echo "3. GitHub repository'sini Render'a bağlayın"
echo "4. GitHub repository'sini Vercel'e bağlayın"
echo ""
echo "Detaylı kurulum talimatları için: DEPLOYMENT.md dosyasını okuyun"
echo ""
