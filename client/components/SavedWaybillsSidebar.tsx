"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Edit2, Check, Clock, Calendar, Bell, BellOff, Loader2 } from "lucide-react";
import { Waybill } from "@/hooks/useWaybills";
import { Courier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SavedWaybillsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  waybills: Waybill[];
  isLoading?: boolean;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<Waybill>) => void;
  onTogglePolling: (id: number) => void;
  onSelect: (waybill: Waybill) => void;
  couriers: Courier[];
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Waybill>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

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

  const getCourierName = (code: string) => {
    const courier = couriers.find((c) => c.code === code);
    return courier?.description || code;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStartEdit = (waybill: Waybill) => {
    setEditingId(waybill.id);
    setEditForm({
      awb: waybill.awb,
      courier: waybill.courier,
      phone_number: waybill.phone_number,
    });
  };

  const handleSaveEdit = (id: number) => {
    if (editForm.awb && editForm.courier) {
      onUpdate(id, {
        awb: editForm.awb,
        courier: editForm.courier,
        phone_number: editForm.phone_number,
      });
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: number) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
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
                    waybill.has_update ? "border-green-500 border-2" : ""
                  }`}
                >
                  {editingId === waybill.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.awb || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, awb: e.target.value }))
                        }
                        placeholder="Nomor Resi"
                      />
                      <Select
                        value={editForm.courier}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, courier: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kurir" />
                        </SelectTrigger>
                        <SelectContent>
                          {couriers.map((courier) => (
                            <SelectItem key={courier.code} value={courier.code}>
                              {courier.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={editForm.phone_number || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            phone_number: e.target.value,
                          }))
                        }
                        placeholder="No. Telepon (opsional)"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(waybill.id)}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Simpan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div
                          className="cursor-pointer flex-1"
                          onClick={() => onSelect(waybill)}
                        >
                          <p className="font-medium text-sm">{waybill.awb}</p>
                          <p className="text-xs text-muted-foreground">
                            {getCourierName(waybill.courier)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onTogglePolling(waybill.id)}
                            title={waybill.polling_enabled ? "Nonaktifkan notifikasi" : "Aktifkan notifikasi"}
                          >
                            {waybill.polling_enabled ? (
                              <Bell className="h-4 w-4 text-green-500" />
                            ) : (
                              <BellOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStartEdit(waybill)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${
                              deleteConfirmId === waybill.id
                                ? "text-red-500 hover:text-red-600"
                                : ""
                            }`}
                            onClick={() => handleDelete(waybill.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(waybill.created_at)}
                        </span>
                        {waybill.last_checked_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Terakhir: {formatDate(waybill.last_checked_at)}
                          </span>
                        )}
                      </div>
                      {waybill.phone_number && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Telp: {waybill.phone_number}
                        </p>
                      )}
                      {waybill.has_update && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Ada pembaruan status!
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => onSelect(waybill)}
                      >
                        Lacak Sekarang
                      </Button>
                    </>
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
