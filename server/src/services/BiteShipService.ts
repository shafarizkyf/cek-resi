import { config } from '../config';
import { Courier, TrackingData, ApiError, TrackingEvent } from '../types';

export class BiteShipService {
  private static baseUrl = config.biteship.apiUrl;
  private static apiKey = config.biteship.apiKey;

  static async fetchCouriers(): Promise<Courier[]> {
    const url = `${this.baseUrl}/v1/couriers`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as Record<string, any>;
      throw {
        status: response.status,
        message: errorData.message || 'BiteShip couriers request failed',
      } as ApiError;
    }

    const data = (await response.json()) as Record<string, any>;

    if (!data.success) {
      throw {
        status: response.status || 400,
        message: response.statusText || 'BiteShip error',
      } as ApiError;
    }

    const uniqueCouriers = new Map<string, string>();
    for (const c of data.couriers) {
      if (!uniqueCouriers.has(c.courier_code)) {
        uniqueCouriers.set(c.courier_code, c.courier_name);
      }
    }

    return Array.from(uniqueCouriers.entries()).map(([code, name]) => ({
      code,
      description: name,
    }));
  }

  static async fetchTracking(courier: string, awb: string): Promise<TrackingData> {
    const url = `${this.baseUrl}/v1/trackings/${awb}/couriers/${courier}`;
    const response = await fetch(url, {
      headers: {
        Authorization: this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as Record<string, any>;
      throw {
        status: response.status,
        message: errorData.error,
      } as ApiError;
    }

    const data = (await response.json()) as Record<string, any>;

    if (!data.success) {
      throw {
        status: 'BiteShip error',
        message: 'BiteShip tracking failed',
      } as ApiError;
    }

    const history: TrackingEvent[] = (data.history || []).map(
      (h: { updated_at: string; note: string; location: string }) => ({
        date: h.updated_at,
        desc: h.note,
        location: h.location || '',
      })
    ).reverse();

    return {
      status: 200,
      data: {
        summary: {
          awb,
          courier,
          status: data.status,
          date: history.length ? history[0].date : '',
        },
        detail: {
          origin: `${data.origin?.contact_name || ''} ${data.origin?.address || ''}`,
          destination: `${data.destination?.contact_name || ''} ${data.destination?.address || ''}`,
          shipper: '',
          receiver: '',
        },
        history,
      },
    };
  }
}
