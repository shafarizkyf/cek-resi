import { useQuery } from '@tanstack/react-query';
import { Courier } from '@/types';

const getApiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl || baseUrl === '/api') {
    return path;
  }
  return `${baseUrl}${path}`;
};

export function useCouriers() {
  return useQuery<Courier[]>({
    queryKey: ['couriers'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/couriers'));
      return res.json();
    },
  });
}
