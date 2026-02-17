# Cek Resi - Indonesian Waybill Tracking App

Track packages from multiple Indonesian couriers (JNE, J&T, SiCepat, TIKI, etc.) in one place.

## Demo
- https://cek-resi.shafarizkyf.com/ (Kalo listrik rumah ga mati wkwkw)

[![Tonton di YouTube](https://img.youtube.com/vi/cnH7g1iwnAI/default.jpg)](https://youtu.be/cnH7g1iwnAI)


## Features

- Track packages from 24+ Indonesian couriers
- Automatic fallback when primary API provider fails
- Beautiful, responsive UI with shadcn/ui
- Docker support for easy deployment

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Express.js, TypeScript
- **API Providers**: BinderByte (primary), BiteShip (fallback)
- **Deployment**: Docker, Docker Compose

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- BinderByte API key (https://binderbyte.com)
- BiteShip API key (optional, for fallback) (https://biteship.com)

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy environment file and add your API keys:
```bash
cp .env.example .env
# Edit .env with your BINDERBYTE_API_KEY and BITESHIP_API_KEY
```

3. Run development servers:
```bash
npm run dev
```

- Client: http://localhost:3000
- Server: http://localhost:3001

### Docker

1. Copy environment file and add your API keys:
```bash
cp .env.example .env
# Edit .env with your BINDERBYTE_API_KEY and BITESHIP_API_KEY
```

2. (optional, if you want to deploy to your server) update `server_name` in nginx/nginx.conf

3. Build and run:
```bash
docker-compose up -d
```

- Client: http://localhost:3000
- Server: http://localhost:3001

4. View logs:
```bash
docker-compose logs -f
```

5. Stop:
```bash
docker-compose down
```

## Project Structure

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
└── .env.example         # Environment variables template
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `BINDERBYTE_API_URL` | BinderByte API URL | `https://api.binderbyte.com` |
| `BINDERBYTE_API_KEY` | BinderByte API key | - |
| `BITESHIP_API_URL` | BiteShip API URL | `https://api.biteship.com` |
| `BITESHIP_API_KEY` | BiteShip API key | - |
| `DEFAULT_PROVIDER` | Primary API provider | `binderbyte` |
| `FALLBACK_PROVIDER` | Fallback API provider | `biteship` |
| `NEXT_PUBLIC_API_URL` | Server URL for client | `http://localhost:3001` |

## Supported Couriers

JNE, POS Indonesia, J&T Express, J&T Cargo, SiCepat, TIKI, AnterAja, Wahana, Ninja Express, Lion Parcel, PCP Express, JET Express, REX Express, First Logistics, ID Express, Shopee Express, KGXpress, SAP Express, RPX, Lazada Express, Indah Cargo, Dakota Cargo, Kurir Rekomendasi

## API Endpoints

### GET /api/couriers
Get list of available couriers.

### GET /api/track?courier={code}&awb={number}
Track a package.

**Parameters:**
- `courier`: Courier code (e.g., `jne`, `jnt`, `sicepat`)
- `awb`: Waybill/AWB number

## License

MIT
