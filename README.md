# Oto-mesaj

Otomatik mesaj gönderme sistemi - PDF'den şirket bilgilerini ayrıştırır ve mesaj gönderir.

## Local Development

```bash
npm install
npm run dev
```

## Vercel Deployment

### Environment Variables

Vercel'de deploy etmek için şu environment variable'ları ekleyin:

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob Storage token
  - Vercel dashboard'da Storage > Blob sekmesinden oluşturabilirsiniz
  - Ücretsiz tier mevcuttur

### Deployment

```bash
npm run build
vercel
```

## Database

- **Local Development**: lowdb (JSON file storage)
- **Vercel Production**: Vercel Blob Storage (kalıcı JSON storage)

Sistem otomatik olarak environment variable'lara göre doğru storage'ı kullanır.
