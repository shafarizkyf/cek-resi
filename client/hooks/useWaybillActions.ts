"use client";

import { Waybill } from "@/types";
import { LocalWaybill } from "@/hooks/useSavedWaybills";
import { WaybillData } from "@/components/SavedWaybillsSidebar";

interface UseWaybillActionsParams {
  isLoggedIn: boolean;
  dbWaybills: Waybill[];
  localWaybills: LocalWaybill[];
  mutations: {
    createWaybill: ReturnType<typeof import("@/hooks/useWaybills").useCreateWaybill>;
    updateWaybill: ReturnType<typeof import("@/hooks/useWaybills").useUpdateWaybill>;
    deleteWaybill: ReturnType<typeof import("@/hooks/useWaybills").useDeleteWaybill>;
    togglePolling: ReturnType<typeof import("@/hooks/useWaybills").useTogglePolling>;
    checkWaybill: ReturnType<typeof import("@/hooks/useWaybills").useCheckWaybill>;
    importWaybills: ReturnType<typeof import("@/hooks/useWaybills").useImportWaybills>;
  };
  localActions: {
    saveLocalWaybill: (waybill: { awb: string; courier: string; phoneNumber?: string }) => void;
    updateLocalWaybill: (id: string, data: { awb: string; courier: string; phoneNumber?: string }) => void;
    deleteLocalWaybill: (id: string) => void;
    markLocalAsChecked: (id: string) => void;
  };
  ui: {
    isLoginModalOpen: boolean;
    deleteConfirmOpen: boolean;
    deleteTargetId: number | string | null;
    importConfirmOpen: boolean;
    importData: any[];
    setIsLoginModalOpen: (open: boolean) => void;
    setDeleteConfirmOpen: (open: boolean) => void;
    setDeleteTargetId: (id: number | string | null) => void;
    setImportConfirmOpen: (open: boolean) => void;
    setImportData: (data: any[]) => void;
  };
  refetch: () => void;
  updateHasWaybills: (value: boolean) => void;
}

const STORAGE_KEY = "cek-resi-saved-waybills";

export function useWaybillActions({
  isLoggedIn,
  dbWaybills,
  localWaybills,
  mutations,
  localActions,
  ui,
  refetch,
  updateHasWaybills,
}: UseWaybillActionsParams) {
  const handleTrack = async (awbNumber: string, selectedCourier: string) => {
    if (!awbNumber || !selectedCourier) return;

    if (isLoggedIn) {
      const existingWaybill = dbWaybills.find(
        (wb) => wb.awb === awbNumber && wb.courier === selectedCourier
      );
      if (existingWaybill) {
        await mutations.checkWaybill.mutateAsync(Number(existingWaybill.id));
      }
    } else {
      const existingWaybill = localWaybills.find(
        (wb) => wb.awb === awbNumber && wb.courier === selectedCourier
      );
      if (existingWaybill) {
        localActions.markLocalAsChecked(String(existingWaybill.id));
      }
    }
    refetch();
  };

  const handleSave = async (awbNumber: string, selectedCourier: string, phoneNumber: string) => {
    if (!awbNumber || !selectedCourier) return;

    if (isLoggedIn) {
      await mutations.createWaybill.mutateAsync({
        awb: awbNumber,
        courier: selectedCourier,
        phoneNumber: phoneNumber || undefined,
      });
    } else {
      localActions.saveLocalWaybill({
        awb: awbNumber,
        courier: selectedCourier,
        phoneNumber: phoneNumber || undefined,
      });
    }
  };

  const handleSelectWaybill = (waybill: Waybill | LocalWaybill, setPhoneNumber: (value: string) => void, setIsSidebarOpen: (open: boolean) => void) => {
    setPhoneNumber(waybill.phoneNumber || "");
    setIsSidebarOpen(false);

    setTimeout(async () => {
      if (isLoggedIn && typeof waybill.id === "number") {
        try {
          await mutations.checkWaybill.mutateAsync(waybill.id);
          refetch();
        } catch {
          // Ignore
        }
      } else if (!isLoggedIn && typeof waybill.id === "string") {
        localActions.markLocalAsChecked(waybill.id);
        refetch();
      }
    }, 100);
  };

  const handleDeleteClick = (id: number | string) => {
    ui.setDeleteTargetId(id);
    ui.setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (ui.deleteTargetId === null) return;

    if (isLoggedIn) {
      await mutations.deleteWaybill.mutateAsync(Number(ui.deleteTargetId));
    } else {
      localActions.deleteLocalWaybill(String(ui.deleteTargetId));
    }
    ui.setDeleteConfirmOpen(false);
    ui.setDeleteTargetId(null);
  };

  const handleTogglePolling = async (id: number | string) => {
    if (!isLoggedIn) {
      ui.setIsLoginModalOpen(true);
      return;
    }
    await mutations.togglePolling.mutateAsync(Number(id));
  };

  const handleUpdateWaybill = async (id: number | string, data: Partial<WaybillData>) => {
    if (!data.awb) return;

    const updateData = {
      awb: data.awb,
      courier: data.courier || "",
      phoneNumber: data.phoneNumber ?? undefined,
    };

    if (isLoggedIn) {
      await mutations.updateWaybill.mutateAsync({ id: Number(id), data: updateData });
    } else {
      localActions.updateLocalWaybill(String(id), updateData);
    }
  };

  const handleImportConfirm = () => {
    if (ui.importData.length > 0) {
      mutations.importWaybills.mutate(ui.importData);
      updateHasWaybills(true);
      localStorage.removeItem(STORAGE_KEY);
    }
    ui.setImportConfirmOpen(false);
    ui.setImportData([]);
  };

  return {
    handleTrack,
    handleSave,
    handleSelectWaybill,
    handleDeleteClick,
    handleDeleteConfirm,
    handleTogglePolling,
    handleUpdateWaybill,
    handleImportConfirm,
  };
}
