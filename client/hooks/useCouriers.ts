import { useQuery } from '@tanstack/react-query';
import { Courier } from '@/types';

export function useCouriers() {
  return useQuery<Courier[]>({
    queryKey: ['couriers'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/couriers`);
      return res.json();
    },
  });
}
