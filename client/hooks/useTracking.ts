import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { TrackingData, ApiResponse } from '@/types';

const getApiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl || baseUrl === '/api') {
    return path;
  }
  return `${baseUrl}${path}`;
};

export function useTracking(courier: string, awb: string, phoneNumber?: string) {
  return useQuery<TrackingData | null>({
    queryKey: ['tracking', courier, awb, phoneNumber],
    queryFn: async () => {
      if (!courier || !awb) return null;
      let url = `${getApiUrl('/api/track')}?courier=${courier}&awb=${awb}`;
      if (phoneNumber) {
        url += `&number=${phoneNumber}`;
      }
      const res = await fetch(url);
      const data: ApiResponse = await res.json();

      if (res.status === 522) {
        throw new Error('Layanan sedang gangguan, coba lagi nanti');
      }
      if (res.status === 404) {
        throw new Error('Nomor resi tidak ditemukan');
      }
      if (res.status === 401) {
        throw new Error('Konfigurasi API tidak valid');
      }
      if (res.status === 422) {
        throw new Error('Kurir tidak valid');
      }
      if (!res.ok || data.status !== 200) {
        throw new Error(data.message || 'Gagal mengambil data');
      }
      if (data.data) {
        return {
          summary: data.data.summary,
          detail: data.data.detail,
          history: data.data.history || [],
        };
      }
      throw new Error(data.message || 'Tracking data not found');
    },
    enabled: false,
    placeholderData: keepPreviousData,
  });
}
