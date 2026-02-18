"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Courier } from "@/types";
import { Button } from "@/components/ui/button";
import { WaybillItem } from "./WaybillItem";
import { WaybillEditForm } from "./WaybillEditForm";

interface WaybillData {
  id: number | string;
  awb: string;
  courier: string;
  phone_number?: string | null;
  phoneNumber?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  last_checked_at?: string | null;
  lastCheckedAt?: string | null;
  polling_enabled?: boolean;
  pollingEnabled?: boolean;
  has_update?: boolean;
  hasUpdate?: boolean;
}

interface SavedWaybillsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  waybills: WaybillData[];
  isLoading?: boolean;
  onDelete: (id: number | string) => void;
  onUpdate: (id: number | string, data: Partial<WaybillData>) => void;
  onTogglePolling: (id: number | string) => void;
  onSelect: (waybill: WaybillData) => void;
  couriers: Courier[];
}

interface EditingState {
  id: number | string | null;
  data: {
    awb: string;
    courier: string;
    phoneNumber: string;
  };
}

export function SavedWaybillsSidebar({
  isOpen,
  onClose,
  waybills,
  isLoading,
  onDelete,
  onUpdate,
  onTogglePolling,
  onSelect,
  couriers,
}: SavedWaybillsSidebarProps) {
  const [editing, setEditing] = useState<EditingState>({
    id: null,
    data: { awb: "", courier: "", phoneNumber: "" },
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<
    number | string | null
  >(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const getPhoneNumber = (waybill: WaybillData): string | null | undefined =>
    waybill.phone_number || waybill.phoneNumber;
  const getCreatedAt = (waybill: WaybillData): string | null | undefined =>
    waybill.created_at || waybill.createdAt;
  const getLastCheckedAt = (waybill: WaybillData): string | null | undefined =>
    waybill.last_checked_at || waybill.lastCheckedAt;
  const getPollingEnabled = (waybill: WaybillData) =>
    waybill.polling_enabled ?? waybill.pollingEnabled ?? false;
  const getHasUpdate = (waybill: WaybillData) =>
    waybill.has_update ?? waybill.hasUpdate ?? false;

  const handleStartEdit = (waybill: WaybillData) => {
    setEditing({
      id: waybill.id,
      data: {
        awb: waybill.awb,
        courier: waybill.courier,
        phoneNumber: getPhoneNumber(waybill) || "",
      },
    });
  };

  const handleSaveEdit = () => {
    if (editing.id && editing.data.awb && editing.data.courier) {
      onUpdate(editing.id, {
        awb: editing.data.awb,
        courier: editing.data.courier,
        phoneNumber: editing.data.phoneNumber,
      });
      setEditing({ id: null, data: { awb: "", courier: "", phoneNumber: "" } });
    }
  };

  const handleCancelEdit = () => {
    setEditing({ id: null, data: { awb: "", courier: "", phoneNumber: "" } });
  };

  const handleDelete = (id: number | string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Riwayat Resi</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : waybills.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Belum ada resi tersimpan</p>
              <p className="text-sm mt-1">
                Masukkan resi dan klik &quot;Simpan&quot; untuk menyimpan
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {waybills.map((waybill) => (
                <div
                  key={waybill.id}
                  className={`border rounded-lg p-3 bg-card ${
                    getHasUpdate(waybill) ? "border-green-500 border-2" : ""
                  }`}
                >
                  {editing.id === waybill.id ? (
                    <WaybillEditForm
                      initialData={editing.data}
                      couriers={couriers}
                      onChange={(data) =>
                        setEditing((prev) => ({ ...prev, data }))
                      }
                      onSave={handleSaveEdit}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <WaybillItem
                      waybill={waybill}
                      getCourierName={(code) => {
                        const courier = couriers.find((c) => c.code === code);
                        return courier?.description || code;
                      }}
                      formatDate={(dateString) => {
                        if (!dateString) return "-";
                        const date = new Date(dateString);
                        return date.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }}
                      getPhoneNumber={getPhoneNumber}
                      getCreatedAt={getCreatedAt}
                      getLastCheckedAt={getLastCheckedAt}
                      getPollingEnabled={getPollingEnabled}
                      getHasUpdate={getHasUpdate}
                      isDeleteConfirm={deleteConfirmId === waybill.id}
                      onTogglePolling={() => onTogglePolling(waybill.id)}
                      onEdit={() => handleStartEdit(waybill)}
                      onDelete={() => handleDelete(waybill.id)}
                      onSelect={() => onSelect(waybill)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
