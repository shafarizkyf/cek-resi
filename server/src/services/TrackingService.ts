import { BinderByteService } from './BinderByteService';
import { BiteShipService } from './BiteShipService';
import { TrackingData, ApiError } from '../types';

export class TrackingService {
  static async track(courier: string, awb: string): Promise<{ data?: TrackingData; error?: ApiError }> {
    try {
      const data = await BinderByteService.fetchTracking(courier, awb);

      if (data.status === 200 && data.data) {
        return { data };
      }

      if (data.status === 401) {
        return { error: { status: 401, message: 'Invalid API key' } };
      }
      if (data.status === 404) {
        return { error: { status: 404, message: 'AWB number not found' } };
      }
      if (data.status === 422) {
        return { error: { status: 422, message: data.message || 'Invalid courier' } };
      }

      throw { status: data.status, message: data.message || 'BinderByte failed' };
    } catch (binderByteError: any) {
      console.log('BinderByte failed, trying BiteShip...', binderByteError);

      try {
        const data = await BiteShipService.fetchTracking(courier, awb);
        return { data };
      } catch (biteshipError: any) {
        console.error('BiteShip also failed:', biteshipError);

        if (biteshipError.status === 401) {
          return { error: { status: 401, message: 'Invalid API key' } };
        }
        if (biteshipError.status === 404) {
          return { error: { status: 404, message: 'AWB number not found' } };
        }

        return { error: { status: 500, message: 'All API providers failed' } };
      }
    }
  }
}
