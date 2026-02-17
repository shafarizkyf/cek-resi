# Cek Resi - Aplikasi Pelacakan Paket Indonesia

Lacak paket dari berbagai kurir Indonesia (JNE, J&T, SiCepat, TIKI, dll.) dalam satu tempat.

## Demo
- https://cek-resi.shafarizkyf.com/ (Kalo listrik rumah ga mati wkwkw)

[![Tonton di YouTube](https://img.youtube.com/vi/cnH7g1iwnAI/0.jpg)](https://youtu.be/cnH7g1iwnAI)


## Fitur

- Lacak paket dari 24+ kurir Indonesia
- Fallback otomatis saat provider API utama gagal
- UI yang indah dan responsif dengan shadcn/ui
- Dukungan Docker untuk kemudahan deployment

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Express.js, TypeScript
- **Provider API**: BinderByte (utama), BiteShip (fallback)
- **Deployment**: Docker, Docker Compose

## Prasyarat

- Node.js 20+
- Docker & Docker Compose
- BinderByte API key (https://binderbyte.com)
- BiteShip API key (opsional, untuk fallback) (https://biteship.com)

## Mulai Cepat

### Pengembangan Lokal

1. Install dependensi:
```bash
npm install
```

2. Copy file environment dan tambahkan API keys:
```bash
cp .env.example .env
# Edit .env dengan BINDERBYTE_API_KEY dan BITESHIP_API_KEY
```

3. Jalankan server pengembangan:
```bash
npm run dev
```

- Client: http://localhost:3000
- Server: http://localhost:3001

### Docker

1. Copy file environment dan tambahkan API keys:
```bash
cp .env.example .env
# Edit .env dengan BINDERBYTE_API_KEY dan BITESHIP_API_KEY
```

2. (opsional, jika ingin deploy ke server) update `server_name` di nginx/nginx.conf

3. Build dan jalankan:
```bash -d
```


docker-compose up- Client: http://localhost:3000
- Server: http://localhost:3001

4. Lihat logs:
```bash
docker-compose logs -f
```

5. Stop:
```bash
docker-compose down
```

## Struktur Proyek

```
cek-resi/
├── client/                 # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript interfaces
├── server/               # Express.js backend
│   └── src/
│       ├── config/      # Environment configuration
│       ├── routes/      # Express routes
│       ├── services/    # API services
│       └── types/       # TypeScript interfaces
├── docker-compose.yml    # Docker orchestration
```

## Variabel Environment

| Variabel | Deskripsi | Default |
|----------|-----------|---------|
| `PORT` | Port server | `3001` |
| `BINDERBYTE_API_URL` | URL API BinderByte | `https://api.binderbyte.com` |
| `BINDERBYTE_API_KEY` | API key BinderByte | - |
| `BITESHIP_API_URL` | URL API BiteShip | `https://api.biteship.com` |
| `BITESHIP_API_KEY` | API key BiteShip | - |
| `DEFAULT_PROVIDER` | Provider API utama | `binderbyte` |
| `FALLBACK_PROVIDER` | Provider API fallback | `biteship` |
| `NEXT_PUBLIC_API_URL` | URL server untuk client | `http://localhost:3001` |

## Kurir yang Didukung

JNE, POS Indonesia, J&T Express, J&T Cargo, SiCepat, TIKI, AnterAja, Wahana, Ninja Express, Lion Parcel, PCP Express, JET Express, REX Express, First Logistics, ID Express, Shopee Express, KGXpress, SAP Express, RPX, Lazada Express, Indah Cargo, Dakota Cargo, Kurir Rekomendasi

## Endpoint API

### GET /api/couriers
Mendapatkan daftar kurir yang tersedia.

### GET /api/track?courier={code}&awb={number}
Melacak paket.

**Parameter:**
- `courier`: Kode kurir (contoh: `jne`, `jnt`, `sicepat`)
- `awb`: Nomor resi/AWB

## Lisensi

MIT
