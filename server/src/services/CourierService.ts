import { BinderByteService } from './BinderByteService';
import { BiteShipService } from './BiteShipService';
import { config } from '../config';
import { Courier } from '../types';

const fallbackCouriers: Courier[] = [
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

export class CourierService {
  static async getCouriers(): Promise<Courier[]> {
    const { default: defaultProvider, fallback: fallbackProvider } = config.providers;
    const providers = [defaultProvider, fallbackProvider];
    const errors: any[] = [];

    for (const provider of providers) {
      if (provider === 'binderbyte') {
        try {
          return await BinderByteService.fetchCouriers();
        } catch (error: any) {
          console.log('BinderByte failed for couriers, trying next provider...', error);
          errors.push({ provider, error });
        }
      } else if (provider === 'biteship') {
        try {
          return await BiteShipService.fetchCouriers();
        } catch (error: any) {
          console.log('BiteShip failed for couriers, trying next provider...', error);
          errors.push({ provider, error });
        }
      }
    }

    console.error('All providers failed for couriers:', errors);
    return fallbackCouriers;
  }
}
