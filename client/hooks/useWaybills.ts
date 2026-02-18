"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getApiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl || baseUrl === '/api') {
    return path;
  }
  return `${baseUrl}${path}`;
};

const getAuthHeaders = async () => {
  const { auth } = await import('@/lib/firebase');
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export interface Waybill {
  id: number;
  user_id: string;
  awb: string;
  courier: string;
  phone_number: string | null;
  polling_enabled: boolean;
  polling_interval_hours: number;
  last_checked_at: string | null;
  last_status: string | null;
  status_detail: string | null;
  has_update: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrackingHistory {
  id: number;
  waybill_id: number;
  status: string | null;
  location: string | null;
  description: string | null;
  event_date: string | null;
  checked_at: string;
}

export function useWaybills(pollingOnly = false) {
  return useQuery<Waybill[]>({
    queryKey: ['waybills', pollingOnly],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const url = pollingOnly 
        ? `${getApiUrl('/api/waybills')}?polling=true`
        : getApiUrl('/api/waybills');
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Failed to fetch waybills');
      const data = await res.json();
      return data.data;
    },
  });
}

export function useCreateWaybill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { awb: string; courier: string; phoneNumber?: string }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(getApiUrl('/api/waybills'), {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create waybill');
      }
      const result = await res.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    },
  });
}

export function useUpdateWaybill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Waybill> }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${getApiUrl(`/api/waybills/${id}`)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update waybill');
      const result = await res.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    },
  });
}

export function useDeleteWaybill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${getApiUrl(`/api/waybills/${id}`)}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Failed to delete waybill');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    },
  });
}

export function useTogglePolling() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${getApiUrl(`/api/waybills/${id}/toggle-polling`)}`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error('Failed to toggle polling');
      const result = await res.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    },
  });
}

export function useCheckWaybill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${getApiUrl(`/api/waybills/${id}/check`)}`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error('Failed to check waybill');
      const result = await res.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    },
  });
}

export function useWaybillHistory(waybillId: number | null) {
  return useQuery<TrackingHistory[]>({
    queryKey: ['waybillHistory', waybillId],
    queryFn: async () => {
      if (!waybillId) return [];
      const headers = await getAuthHeaders();
      const res = await fetch(`${getApiUrl(`/api/waybills/${waybillId}/history`)}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      return data.data;
    },
    enabled: !!waybillId,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (waybillIds?: number[]) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${getApiUrl('/api/waybills/mark-read')}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ waybillIds }),
      });
      if (!res.ok) throw new Error('Failed to mark as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    },
  });
}

export function useImportWaybills() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (waybills: { awb: string; courier: string; phoneNumber?: string }[]) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${getApiUrl('/api/waybills/import')}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ waybills }),
      });
      if (!res.ok) throw new Error('Failed to import waybills');
      const result = await res.json();
      return result.data.imported;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    },
  });
}
