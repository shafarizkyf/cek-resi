import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const BINDERBYTE_API_URL = process.env.BINDERBYTE_API_URL || 'https://api.binderbyte.com';
const BINDERBYTE_API_KEY = process.env.BINDERBYTE_API_KEY || '';
const BITESHIP_API_URL = process.env.BITESHIP_API_URL || 'https://api.biteship.com';
const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY || '';

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

interface TrackingData {
  status: number;
  data?: {
    summary: {
      awb: string;
      courier: string;
      status: string;
      date: string;
    };
    detail: {
      origin: string;
      destination: string;
      shipper: string;
      receiver: string;
    };
    history: Array<{
      date: string;
      desc: string;
      location: string;
    }>;
  };
  message?: string;
}

async function fetchBinderByte(courier: string, awb: string): Promise<TrackingData> {
  const url = `${BINDERBYTE_API_URL}/v1/track?api_key=${BINDERBYTE_API_KEY}&courier=${courier}&awb=${awb}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json() as Record<string, any>;
    throw { status: response.status, message: errorData.message || 'BinderByte request failed' };
  }
  
  return response.json() as Promise<TrackingData>;
}

async function fetchBiteShip(awb: string, courier: string): Promise<TrackingData> {
  const url = `${BITESHIP_API_URL}/v1/trackings/${awb}/couriers/${courier}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${BITESHIP_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json() as Record<string, any>;
    throw { status: response.status, message: errorData.message || 'BiteShip request failed' };
  }
  
  const data = await response.json() as Record<string, any>;
  
  if (data.code !== 200 && data.code !== 201) {
    throw { status: data.code || 400, message: data.message || 'BiteShip error' };
  }
  
  const tracking = data.tracking;
  const history = (tracking.history || []).map((h: { created_at: string; note: string; location: string }) => ({
    date: h.created_at,
    desc: h.note,
    location: h.location || '',
  })).reverse();
  
  return {
    status: 200,
    data: {
      summary: {
        awb: tracking.waybill_id || awb,
        courier: tracking.courier_code || courier,
        status: tracking.status || 'UNKNOWN',
        date: tracking.waybill_date || '',
      },
      detail: {
        origin: tracking.origin || '',
        destination: tracking.destination || '',
        shipper: tracking.shipper || '',
        receiver: tracking.receiver || '',
      },
      history,
    },
  };
}

app.get('/api/track', async (req: Request, res: Response) => {
  const { courier, awb } = req.query;

  if (!courier || !awb) {
    res.status(400).json({ status: 400, message: 'Missing courier or awb parameter' });
    return;
  }

  try {
    let data = await fetchBinderByte(courier as string, awb as string);
    
    if (data.status === 200 && data.data) {
      res.json(data);
      return;
    }
    
    if (data.status === 401) {
      res.status(401).json({ status: 401, message: 'Invalid API key' });
      return;
    }
    if (data.status === 404) {
      res.status(404).json({ status: 404, message: 'AWB number not found', data: null });
      return;
    }
    if (data.status === 422) {
      res.status(422).json({ status: 422, message: data.message || 'Invalid courier' });
      return;
    }
    
    throw { status: data.status, message: data.message || 'BinderByte failed' };
  } catch (binderByteError: any) {
    console.log('BinderByte failed, trying BiteShip...', binderByteError);
    
    try {
      const biteshipData = await fetchBiteShip(awb as string, courier as string);
      res.json(biteshipData);
    } catch (biteshipError: any) {
      console.error('BiteShip also failed:', biteshipError);
      
      if (biteshipError.status === 401) {
        res.status(401).json({ status: 401, message: 'Invalid API key' });
        return;
      }
      if (biteshipError.status === 404) {
        res.status(404).json({ status: 404, message: 'AWB number not found', data: null });
        return;
      }
      
      res.status(500).json({ status: 500, message: 'All API providers failed', error: biteshipError.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
