import { BinderByteService } from './BinderByteService';
import { BiteShipService } from './BiteShipService';
import { config } from '../config';
import { Courier } from '../types';
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
  }
}
