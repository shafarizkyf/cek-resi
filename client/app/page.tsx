"use client";

import { useState, useEffect } from "react";
import { useCouriers } from "@/hooks/useCouriers";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/hooks/useAuth";
import {
  useWaybills,
  useCreateWaybill,
  useUpdateWaybill,
  useDeleteWaybill,
  useTogglePolling,
  useCheckWaybill,
  useImportWaybills,
  Waybill,
} from "@/hooks/useWaybills";
import { TrackingHeader } from "@/components/TrackingHeader";
import { TrackingForm } from "@/components/TrackingForm";
import { TrackingResult } from "@/components/TrackingResult";
import { SavedWaybillsSidebar } from "@/components/SavedWaybillsSidebar";
import { Login } from "@/components/Login";
import { GithubIcon } from "@/components/GithubIcon";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const STORAGE_KEY = "cek-resi-saved-waybills";

export default function Home() {
  const { user, loading: authLoading, signOut, updateHasWaybills } = useAuth();
  const [awbNumber, setAwbNumber] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [importPrompted, setImportPrompted] = useState(false);

  const { data: couriers = [], isLoading: couriersLoading } = useCouriers();
  const { data: waybills = [], isLoading: waybillsLoading } = useWaybills();
  const createWaybill = useCreateWaybill();
  const updateWaybill = useUpdateWaybill();
  const deleteWaybill = useDeleteWaybill();
  const togglePolling = useTogglePolling();
  const checkWaybill = useCheckWaybill();
  const importWaybills = useImportWaybills();

  const {
    data: trackingData,
    isLoading: trackingLoading,
    error,
    refetch,
  } = useTracking(selectedCourier, awbNumber, phoneNumber);

  const isCurrentWaybillSaved = waybills.some(
    (wb) => wb.awb === awbNumber && wb.courier === selectedCourier
  );

  useEffect(() => {
    if (user && !user.hasWaybills && !importPrompted) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const localWaybills = JSON.parse(stored);
          if (localWaybills.length > 0) {
            const shouldImport = window.confirm(
              `Anda memiliki ${localWaybills.length} resi tersimpan di browser. Ingin impor ke akun Anda?`
            );
            if (shouldImport) {
              importWaybills.mutate(localWaybills);
              updateHasWaybills(true);
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        } catch {
          // Invalid JSON, ignore
        }
      }
      setImportPrompted(true);
    }
  }, [user, importPrompted, importWaybills, updateHasWaybills]);

  const handleTrack = async () => {
    if (awbNumber && selectedCourier) {
      const existingWaybill = waybills.find(
        (wb) => wb.awb === awbNumber && wb.courier === selectedCourier
      );
      if (existingWaybill) {
        await checkWaybill.mutateAsync(existingWaybill.id);
      }
      refetch();
    }
  };

  const handleSave = async () => {
    if (awbNumber && selectedCourier) {
      await createWaybill.mutateAsync({
        awb: awbNumber,
        courier: selectedCourier,
        phoneNumber: phoneNumber || undefined,
      });
    }
  };

  const handleSelectWaybill = (waybill: Waybill) => {
    setAwbNumber(waybill.awb);
    setSelectedCourier(waybill.courier);
    setPhoneNumber(waybill.phone_number || "");
    setIsSidebarOpen(false);
    setTimeout(async () => {
      try {
        await checkWaybill.mutateAsync(waybill.id);
        refetch();
      } catch {
        // Ignore
      }
    }, 100);
  };

  const handleDeleteWaybill = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus resi ini?")) {
      await deleteWaybill.mutateAsync(id);
    }
  };

  const handleTogglePolling = async (id: number) => {
    await togglePolling.mutateAsync(id);
  };

  const handleUpdateWaybill = async (id: number, data: Partial<Waybill>) => {
    await updateWaybill.mutateAsync({ id, data });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <a
            href="https://github.com/shafarizkyf/cek-resi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            <GithubIcon className="w-6 h-6" />
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>

        <TrackingHeader />

        <TrackingForm
          couriers={couriers}
          couriersLoading={couriersLoading}
          trackingLoading={trackingLoading || checkWaybill.isPending}
          awbNumber={awbNumber}
          selectedCourier={selectedCourier}
          phoneNumber={phoneNumber}
          error={error}
          isSaved={isCurrentWaybillSaved}
          onAwbChange={setAwbNumber}
          onCourierChange={setSelectedCourier}
          onPhoneNumberChange={setPhoneNumber}
          onTrack={handleTrack}
          onSave={handleSave}
          onOpenHistory={() => setIsSidebarOpen(true)}
        />

        {trackingData && !trackingLoading && (
          <TrackingResult data={trackingData} />
        )}

        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>
            This service uses a third-party API to track shipments. No tracking
            data is stored on our servers.
          </p>
          <p className="mt-1">
            The backend server acts only as a proxy to communicate with the
            third-party provider.
          </p>
        </footer>
      </div>

      <SavedWaybillsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        waybills={waybills}
        isLoading={waybillsLoading}
        onDelete={handleDeleteWaybill}
        onUpdate={handleUpdateWaybill}
        onTogglePolling={handleTogglePolling}
        onSelect={handleSelectWaybill}
        couriers={couriers}
      />
    </main>
  );
}
