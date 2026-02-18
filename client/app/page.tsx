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
import { useSavedWaybills, SavedWaybill } from "@/hooks/useSavedWaybills";
import { TrackingHeader } from "@/components/TrackingHeader";
import { TrackingForm } from "@/components/TrackingForm";
import { TrackingResult } from "@/components/TrackingResult";
import {
  SavedWaybillsSidebar,
  WaybillData,
} from "@/components/SavedWaybillsSidebar";
import { LoginModal } from "@/components/LoginModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { GithubIcon } from "@/components/GithubIcon";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const STORAGE_KEY = "cek-resi-saved-waybills";

export default function Home() {
  const { user, loading: authLoading, signOut, updateHasWaybills } = useAuth();
  const [awbNumber, setAwbNumber] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPrompted, setLoginPrompted] = useState(false);

  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | string | null>(
    null
  );

  // Import confirmation dialog
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);

  const { data: couriers = [], isLoading: couriersLoading } = useCouriers();

  // Use DB waybills if logged in, otherwise use localStorage
  const isLoggedIn = !!user;
  const canUseDb = isLoggedIn && !authLoading;

  // Database waybills (when logged in)
  const { data: dbWaybills = [], isLoading: dbWaybillsLoading } = useWaybills(
    false,
    canUseDb
  );
  const createWaybill = useCreateWaybill();
  const updateWaybill = useUpdateWaybill();
  const deleteWaybill = useDeleteWaybill();
  const togglePolling = useTogglePolling();
  const checkWaybill = useCheckWaybill();
  const importWaybills = useImportWaybills();

  // LocalStorage waybills (when not logged in)
  const {
    waybills: localWaybills,
    saveWaybill: saveLocalWaybill,
    updateWaybill: updateLocalWaybill,
    deleteWaybill: deleteLocalWaybill,
    markAsChecked: markLocalAsChecked,
    isWaybillSaved: isLocalWaybillSaved,
  } = useSavedWaybills();

  const waybills = isLoggedIn ? dbWaybills : localWaybills;
  const waybillsLoading = isLoggedIn ? dbWaybillsLoading : false;
  const isSaved = isLoggedIn
    ? dbWaybills.some(
        (wb) => wb.awb === awbNumber && wb.courier === selectedCourier
      )
    : isLocalWaybillSaved(awbNumber, selectedCourier);

  const {
    data: trackingData,
    isLoading: trackingLoading,
    error,
    refetch,
  } = useTracking(selectedCourier, awbNumber, phoneNumber);

  // Import localStorage to DB on first login
  useEffect(() => {
    if (user && !user.hasWaybills && !loginPrompted) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const localWaybillsData = JSON.parse(stored);
          if (localWaybillsData.length > 0) {
            setImportData(localWaybillsData);
            setImportConfirmOpen(true);
          }
        } catch {
          // Invalid JSON, ignore
        }
      }
      setLoginPrompted(true);
    }
  }, [user, loginPrompted, importWaybills, updateHasWaybills]);

  const handleImportConfirm = () => {
    if (importData.length > 0) {
      importWaybills.mutate(importData);
      updateHasWaybills(true);
      localStorage.removeItem(STORAGE_KEY);
    }
    setImportConfirmOpen(false);
    setImportData([]);
  };

  const handleTrack = async () => {
    if (!awbNumber || !selectedCourier) return;

    if (isLoggedIn) {
      const existingWaybill = dbWaybills.find(
        (wb) => wb.awb === awbNumber && wb.courier === selectedCourier
      );
      if (existingWaybill) {
        await checkWaybill.mutateAsync(existingWaybill.id);
      }
    } else {
      const existingWaybill = localWaybills.find(
        (wb) => wb.awb === awbNumber && wb.courier === selectedCourier
      );
      if (existingWaybill) {
        markLocalAsChecked(existingWaybill.id);
      }
    }
    refetch();
  };

  const handleSave = async () => {
    if (!awbNumber || !selectedCourier) return;

    if (isLoggedIn) {
      await createWaybill.mutateAsync({
        awb: awbNumber,
        courier: selectedCourier,
        phoneNumber: phoneNumber || undefined,
      });
    } else {
      saveLocalWaybill({
        awb: awbNumber,
        courier: selectedCourier,
        phoneNumber: phoneNumber || undefined,
      });
    }
  };

  const handleSelectWaybill = (
    waybill: Waybill | SavedWaybill | WaybillData
  ) => {
    setAwbNumber(waybill.awb);
    setSelectedCourier(waybill.courier);
    setPhoneNumber(
      "phone_number" in waybill
        ? waybill.phone_number || ""
        : waybill.phoneNumber || ""
    );
    setIsSidebarOpen(false);

    setTimeout(async () => {
      if (isLoggedIn && "id" in waybill && typeof waybill.id === "number") {
        try {
          await checkWaybill.mutateAsync(waybill.id);
          refetch();
        } catch {
          // Ignore
        }
      } else if (!isLoggedIn && "id" in waybill) {
        markLocalAsChecked(String(waybill.id));
        refetch();
      }
    }, 100);
  };

  const handleDeleteClick = (id: number | string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return;

    if (isLoggedIn) {
      await deleteWaybill.mutateAsync(Number(deleteTargetId));
    } else {
      deleteLocalWaybill(String(deleteTargetId));
    }
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const handleTogglePolling = async (id: number | string) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    await togglePolling.mutateAsync(Number(id));
  };

  const handleUpdateWaybill = async (id: number | string, data: any) => {
    if (isLoggedIn) {
      await updateWaybill.mutateAsync({ id: Number(id), data });
    } else {
      updateLocalWaybill(String(id), {
        awb: data.awb,
        courier: data.courier || "",
        phoneNumber: data.phoneNumber,
      });
    }
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

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
            {isLoggedIn ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenLoginModal}
              >
                <User className="h-4 w-4 mr-2" />
                Masuk
              </Button>
            )}
          </div>
        </div>

        <TrackingHeader />

        <TrackingForm
          couriers={couriers}
          couriersLoading={couriersLoading}
          trackingLoading={
            trackingLoading || (isLoggedIn && checkWaybill.isPending)
          }
          awbNumber={awbNumber}
          selectedCourier={selectedCourier}
          phoneNumber={phoneNumber}
          error={error}
          isSaved={isSaved}
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
        onDelete={handleDeleteClick}
        onUpdate={handleUpdateWaybill}
        onTogglePolling={handleTogglePolling}
        onSelect={handleSelectWaybill}
        couriers={couriers}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Hapus Resi"
        description="Yakin ingin menghapus resi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
      />

      <ConfirmDialog
        open={importConfirmOpen}
        onOpenChange={setImportConfirmOpen}
        onConfirm={handleImportConfirm}
        title="Impor Resi"
        description={`Anda memiliki ${importData.length} resi tersimpan di browser. Ingin impor ke akun Anda?`}
        confirmText="Impor"
        cancelText="Lewati"
      />
    </main>
  );
}
