"use client";

import { useState, useEffect, useCallback } from "react";

export interface SavedWaybill {
  id: string;
  awb: string;
  courier: string;
  phoneNumber?: string;
  createdAt: string;
  lastCheckedAt?: string;
}

const STORAGE_KEY = "cek-resi-saved-waybills";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useSavedWaybills() {
  const [waybills, setWaybills] = useState<SavedWaybill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWaybills(JSON.parse(stored));
      } catch {
        setWaybills([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(waybills));
    }
  }, [waybills, isLoaded]);

  const saveWaybill = useCallback(
    (waybill: Omit<SavedWaybill, "id" | "createdAt">) => {
      const newWaybill: SavedWaybill = {
        ...waybill,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setWaybills((prev) => [newWaybill, ...prev]);
      return newWaybill;
    },
    []
  );

  const updateWaybill = useCallback(
    (id: string, updates: Partial<Omit<SavedWaybill, "id" | "createdAt">>) => {
      setWaybills((prev) =>
        prev.map((wb) => (wb.id === id ? { ...wb, ...updates } : wb))
      );
    },
    []
  );

  const deleteWaybill = useCallback((id: string) => {
    setWaybills((prev) => prev.filter((wb) => wb.id !== id));
  }, []);

  const markAsChecked = useCallback((id: string) => {
    setWaybills((prev) =>
      prev.map((wb) =>
        wb.id === id ? { ...wb, lastCheckedAt: new Date().toISOString() } : wb
      )
    );
  }, []);

  const getWaybills = useCallback(() => {
    return waybills;
  }, [waybills]);

  const isWaybillSaved = useCallback(
    (awb: string, courier: string) => {
      return waybills.some(
        (wb) => wb.awb === awb && wb.courier === courier
      );
    },
    [waybills]
  );

  return {
    waybills,
    saveWaybill,
    updateWaybill,
    deleteWaybill,
    markAsChecked,
    getWaybills,
    isWaybillSaved,
    isLoaded,
  };
}
