import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const BINDERBYTE_API_KEY = process.env.BINDERBYTE_API_KEY || 'your_api_key_here';
const BINDERBYTE_BASE_URL = 'https://api.binderbyte.com/v1/track';

interface Courier {
  code: string;
  description: string;
}

const couriers: Courier[] = [
  { code: 'jne', description: 'JNE Express' },
  { code: 'pos', description: 'POS Indonesia' },
  { code: 'jnt', description: 'J&T Express' },
  { code: 'jnt_cargo', description: 'J&T Cargo' },
  { code: 'sicepat', description: 'SiCepat' },
  { code: 'tiki', description: 'TIKI' },
  { code: 'anteraja', description: 'AnterAja' },
  { code: 'wahana', description: 'Wahana' },
  { code: 'ninja', description: 'Ninja Express' },
  { code: 'lion', description: 'Lion Parcel' },
  { code: 'pcp', description: 'PCP Express' },
  { code: 'jet', description: 'JET Express' },
  { code: 'rex', description: 'REX Express' },
  { code: 'first', description: 'First Logistics' },
  { code: 'ide', description: 'ID Express' },
  { code: 'spx', description: 'Shopee Express' },
  { code: 'kgx', description: 'KGXpress' },
  { code: 'sap', description: 'SAP Express' },
  { code: 'rpx', description: 'RPX' },
  { code: 'lex', description: 'Lazada Express' },
  { code: 'indah_cargo', description: 'Indah Cargo' },
  { code: 'dakota', description: 'Dakota Cargo' },
  { code: 'kurir_tokopedia', description: 'Kurir Rekomendasi' },
];

app.get('/api/couriers', (_req: Request, res: Response) => {
  res.json(couriers);
});

app.get('/api/track', async (req: Request, res: Response) => {
  const { courier, awb } = req.query;

  if (!courier || !awb) {
    res.status(400).json({ error: 'Missing courier or awb parameter' });
    return;
  }

  try {
    const url = `${BINDERBYTE_BASE_URL}?api_key=${BINDERBYTE_API_KEY}&courier=${courier}&awb=${awb}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
