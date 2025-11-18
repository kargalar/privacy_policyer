# Hesap Silme İsteği Özelliği - Uygulama Özeti

## Gerçekleştirilen Değişiklikler

### 1. **Backend - Prisma Schema** 
- `DeleteRequest` modeli eklendi
  - `id`: UUID (Primary Key)
  - `documentId`: UUID (Document'e referans)
  - `email`: Silme isteyenin email adresi
  - `createdAt`: İstek tarihi
  - Document ile cascade delete ilişkisi

### 2. **Database Migration**
- Yeni migration dosyası oluşturuldu: `20251118095531_add_delete_requests`
- `delete_requests` tablosu oluşturuldu
- Foreign key constraint ile documents tablosuna bağlandı

### 3. **GraphQL Schema**
- `DeleteRequest` tipi eklendi
  - `id`, `documentId`, `email`, `createdAt` alanları
- Document tipine `deleteRequests` alanı eklendi (ilişkili istekler)
- `createDeleteRequest(documentId, email)` mutation eklendi

### 4. **Backend Resolver'lar**
- `createDeleteRequest` mutation resolver'ı eklendi
  - Yayınlanmış (PUBLISHED) dokümanlar için silme isteği oluşturur
  - Email adresi kaydeder
- `document` query'si güncellenmiştir
  - İlişkili deleteRequests listesini döndürür

### 5. **Backend Service**
- `documentService.js` güncellendi
  - `createDeleteRequest()` - Yeni silme isteği oluştur
  - `getDeleteRequestsByDocumentId()` - Doküman için tüm istekleri getir
  - `getDocumentById()` - deleteRequests verisi ile birlikte döndürür

### 6. **Frontend GraphQL Queries**
- `CREATE_DELETE_REQUEST_MUTATION` eklendi
- `GET_DOCUMENT_QUERY` güncellendi
  - deleteRequests verisi dahil edildi

### 7. **Frontend Sayfalar**

#### **DeleteRequestPage** (Yeni Sayfa)
- `/documents/:id/delete-request` rotası
- Kullanıcılar bu sayfaya yönlendirilir
- Email formu ile silme isteği gönderilir
- Başarılı gönderim sonrası onay mesajı gösterilir
- Kullanıcı dostu UI (Tailwind CSS)

#### **DocumentPage** (Güncellenmiş)
- Published dokümanlar için "Create Delete Request" butonu eklendi
- Yeni "Deletion Requests" sekmesi eklendi (eğer istekler varsa)
  - Tablo format'ında silme isteklerini listeler
  - Email adresi, tarih ve geçen gün sayısı gösterilir

### 8. **Frontend Rotaları**
- `App.js` güncellendi
- DeleteRequestPage rotası eklendi
- Public erişim (authentication gerekli değil)

## Kullanıcı Akışı

1. **Doküman Sahibi (Şirket)**
   - Doküman yayınla (PUBLISHED durumu)
   - Doküman detay sayfasında "Create Delete Request" butonunu gör
   - "Deletion Requests" sekmesinde kullanıcıların silme isteklerini gör
   - Talep tarihleri ve email adreslerini takip et

2. **Sonu Kullanıcı (Müşteri)**
   - Yayınlanmış doküman sayfasından erişim sağla
   - "Create Delete Request" butonuna tıkla
   - Email adresini gir
   - İstek gönder
   - Onay sayfası gösterilir

## Veritabanı Şeması

```
documents
├── id
├── user_id → users.id
├── app_name
├── privacy_policy
├── terms_of_service
├── status
├── created_at
└── updated_at

delete_requests (NEW)
├── id
├── document_id → documents.id (CASCADE DELETE)
├── email
└── created_at
```

## API Endpoints (GraphQL)

### Mutation
```graphql
mutation CreateDeleteRequest($documentId: ID!, $email: String!) {
  createDeleteRequest(documentId: $documentId, email: $email) {
    id
    documentId
    email
    createdAt
  }
}
```

### Query
```graphql
query GetDocument($id: ID!) {
  document(id: $id) {
    # ... diğer alanlar
    deleteRequests {
      id
      documentId
      email
      createdAt
    }
  }
}
```

## Uyumluluk Notları

- ✅ Privacy Policy ve Terms of Service gibi davranır
- ✅ Public erişim (kimlik doğrulama gerekli değil)
- ✅ Cascade delete işlemi (doküman silinirse istekler de silinir)
- ✅ Email doğrulama yapılır
- ✅ Responsive design (mobil uyumlu)

## Sonraki Adımlar (İsteğe Bağlı)

1. Email doğrulama gönderme
2. Admin dashboard'da silme isteklerini yönetme
3. Otomatik silme işlemi (GDPR uyumu)
4. Silme isteği iptal etme özelliği
5. Silme isteği exportu/raporlama
