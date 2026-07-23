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

- `POSTGRES_URL` veya `DATABASE_URL`: Vercel Postgres connection string
  - Vercel dashboard'da Storage > Postgres sekmesinden oluşturabilirsiniz
  - Ücretsiz tier mevcuttur

### Deployment

```bash
npm run build
vercel
```

## Database

- **Local Development**: lowdb (JSON file storage)
- **Vercel Production**: PostgreSQL (Vercel Postgres)

Sistem otomatik olarak environment variable'lara göre doğru database'i seçer.
