import { BinderByteService } from './BinderByteService';
import { BiteShipService } from './BiteShipService';
import { config } from '../config';
import { TrackingData, ApiError } from '../types';

export class TrackingService {
  static async track(courier: string, awb: string): Promise<{ data?: TrackingData; error?: ApiError }> {
    const { default: defaultProvider, fallback: fallbackProvider } = config.providers;

    const providers = [defaultProvider, fallbackProvider];
    const errors: any[] = [];

    for (const provider of providers) {
      if (provider === 'binderbyte') {
        try {
          const data = await BinderByteService.fetchTracking(courier, awb);
          if (data.status === 200 && data.data) {
            return { data };
          }
          errors.push({ provider, error: { status: data.status, message: data.message } });
        } catch (error: any) {
          console.error(provider, JSON.stringify(error));
          if (error?.status >= 400 && error?.status < 500) {
            return { error: { status: error.status, message: error.message } };
          }

          console.log(`${provider} failed, trying next provider...`, error);
          errors.push({ provider, error: { status: 500, message: 'Unknown' } });
        }
      } else if (provider === 'biteship') {
        try {
          const data = await BiteShipService.fetchTracking(courier, awb);
          if (data.status === 200 && data.data) {
            return { data };
          }
          errors.push({ provider, error: { status: data.status, message: data.message } });
        } catch (error: any) {
          console.log(`${provider} failed, trying next provider...`, error);
          errors.push({ provider, error });
        }
      }
    }

    const lastError = errors[errors.length - 1]?.error;
    return { error: { status: 500, message: lastError?.message || 'All API providers failed' } };
  }
}
