import { config } from '../config';
import { Courier, TrackingData, ApiError } from '../types';

export class BinderByteService {
  private static baseUrl = config.binderbyte.apiUrl;
  private static apiKey = config.binderbyte.apiKey;

  static async fetchCouriers(): Promise<Courier[]> {
    const url = `${this.baseUrl}/v1/list_courier?api_key=${this.apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = (await response.json()) as Record<string, any>;
      throw {
        status: response.status,
        message: errorData.message || 'BinderByte couriers request failed',
      } as ApiError;
    }

    const data = (await response.json()) as Record<string, any>;

    if (data.code !== 200) {
      throw {
        status: data.code || 400,
        message: data.message || 'BinderByte error',
      } as ApiError;
    }

    return data.couriers.map((c: { code: string; description: string }) => ({
      code: c.code,
      description: c.description,
    }));
  }

  static async fetchTracking(courier: string, awb: string): Promise<TrackingData> {
    const url = `${this.baseUrl}/v1/track?api_key=${this.apiKey}&courier=${courier}&awb=${awb}`;
    const response = await fetch(url);

    if (!response.ok) {
      let errorData;
      try {
        errorData = (await response.json()) as Record<string, any>;
      } catch (error) {
        errorData = {
          message: 'Unknown Error'
        }
      }
      throw {
        status: response.status,
        message: errorData.message,
      } as ApiError;
    }

    return response.json() as Promise<TrackingData>;
  }
}
