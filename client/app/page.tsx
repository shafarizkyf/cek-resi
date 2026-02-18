"use client";

import { useEffect } from "react";
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
import { useSavedWaybills, LocalWaybill } from "@/hooks/useSavedWaybills";
import { useTrackingForm } from "@/hooks/useTrackingForm";
import { useUIState } from "@/hooks/useUIState";
import { useWaybillActions } from "@/hooks/useWaybillActions";
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
  const form = useTrackingForm();
  const ui = useUIState();

  const { data: couriers = [], isLoading: couriersLoading } = useCouriers();

  const isLoggedIn = !!user;
  const canUseDb = isLoggedIn && !authLoading;

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

  const localActions = useSavedWaybills();

  const waybills = isLoggedIn ? dbWaybills : localActions.waybills;
  const waybillsLoading = isLoggedIn ? dbWaybillsLoading : false;
  const isSaved = isLoggedIn
    ? dbWaybills.some(
        (wb) => wb.awb === form.awbNumber && wb.courier === form.selectedCourier
      )
    : localActions.isWaybillSaved(form.awbNumber, form.selectedCourier);

  const {
    data: trackingData,
    isLoading: trackingLoading,
    error,
    refetch,
  } = useTracking(form.selectedCourier, form.awbNumber, form.phoneNumber);

  const waybillActions = useWaybillActions({
    isLoggedIn,
    dbWaybills,
    localWaybills: localActions.waybills,
    mutations: {
      createWaybill,
      updateWaybill,
      deleteWaybill,
      togglePolling,
      checkWaybill,
      importWaybills,
    },
    localActions: {
      saveLocalWaybill: localActions.saveWaybill,
      updateLocalWaybill: localActions.updateWaybill,
      deleteLocalWaybill: localActions.deleteWaybill,
      markLocalAsChecked: localActions.markAsChecked,
    },
    ui: {
      isLoginModalOpen: ui.isLoginModalOpen,
      deleteConfirmOpen: ui.deleteConfirmOpen,
      deleteTargetId: ui.deleteTargetId,
      importConfirmOpen: ui.importConfirmOpen,
      importData: ui.importData,
      setIsLoginModalOpen: ui.setIsLoginModalOpen,
      setDeleteConfirmOpen: ui.setDeleteConfirmOpen,
      setDeleteTargetId: ui.setDeleteTargetId,
      setImportConfirmOpen: ui.setImportConfirmOpen,
      setImportData: ui.setImportData,
    },
    refetch,
    updateHasWaybills,
  });

  useEffect(() => {
    if (user && !user.hasWaybills && !ui.loginPrompted) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const localWaybillsData = JSON.parse(stored);
          if (localWaybillsData.length > 0) {
            ui.setImportData(localWaybillsData);
            ui.setImportConfirmOpen(true);
          }
        } catch {
          // Invalid JSON, ignore
        }
      }
      ui.setLoginPrompted(true);
    }
  }, [user, ui.loginPrompted, importWaybills, updateHasWaybills]);

  const handleSelectWaybillWrapper = (waybill: WaybillData) => {
    form.setAwbNumber(waybill.awb);
    form.setSelectedCourier(waybill.courier);
    waybillActions.handleSelectWaybill(
      waybill,
      form.setPhoneNumber,
      ui.setIsSidebarOpen
    );
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
                onClick={() => ui.setIsLoginModalOpen(true)}
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
          awbNumber={form.awbNumber}
          selectedCourier={form.selectedCourier}
          phoneNumber={form.phoneNumber}
          error={error}
          isSaved={isSaved}
          onAwbChange={form.setAwbNumber}
          onCourierChange={form.setSelectedCourier}
          onPhoneNumberChange={form.setPhoneNumber}
          onTrack={() =>
            waybillActions.handleTrack(form.awbNumber, form.selectedCourier)
          }
          onSave={() =>
            waybillActions.handleSave(
              form.awbNumber,
              form.selectedCourier,
              form.phoneNumber
            )
          }
          onOpenHistory={() => ui.setIsSidebarOpen(true)}
        />

        {trackingData && !trackingLoading && (
          <TrackingResult data={trackingData} />
        )}

        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>
            Layanan ini menggunakan API pihak ketiga untuk melacak pengiriman.
            Data resi hanya akan disimpan apabila Anda mengaktifkan notifikasi.
          </p>
          <p className="mt-1">
            Server backend hanya berfungsi sebagai perantara untuk berkomunikasi
            dengan penyedia layanan pihak ketiga.
          </p>
        </footer>
      </div>

      <SavedWaybillsSidebar
        isOpen={ui.isSidebarOpen}
        onClose={() => ui.setIsSidebarOpen(false)}
        waybills={waybills}
        isLoading={waybillsLoading}
        onDelete={waybillActions.handleDeleteClick}
        onUpdate={waybillActions.handleUpdateWaybill}
        onTogglePolling={waybillActions.handleTogglePolling}
        onSelect={handleSelectWaybillWrapper}
        couriers={couriers}
      />

      <LoginModal
        isOpen={ui.isLoginModalOpen}
        onClose={() => ui.setIsLoginModalOpen(false)}
      />

      <ConfirmDialog
        open={ui.deleteConfirmOpen}
        onOpenChange={ui.setDeleteConfirmOpen}
        onConfirm={waybillActions.handleDeleteConfirm}
        title="Hapus Resi"
        description="Yakin ingin menghapus resi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
      />

      <ConfirmDialog
        open={ui.importConfirmOpen}
        onOpenChange={ui.setImportConfirmOpen}
        onConfirm={waybillActions.handleImportConfirm}
        title="Impor Resi"
        description={`Anda memiliki ${ui.importData.length} resi tersimpan di browser. Ingin impor ke akun Anda?`}
        confirmText="Impor"
        cancelText="Lewati"
      />
    </main>
  );
}
