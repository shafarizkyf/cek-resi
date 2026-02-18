"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Edit2, Check, Clock, Calendar } from "lucide-react";
import { SavedWaybill } from "@/hooks/useSavedWaybills";
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
  waybills: SavedWaybill[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<SavedWaybill>) => void;
  onSelect: (waybill: SavedWaybill) => void;
  couriers: Courier[];
}

export function SavedWaybillsSidebar({
  isOpen,
  onClose,
  waybills,
  onDelete,
  onUpdate,
  onSelect,
  couriers,
}: SavedWaybillsSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SavedWaybill>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const formatDate = (dateString?: string) => {
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

  const handleStartEdit = (waybill: SavedWaybill) => {
    setEditingId(waybill.id);
    setEditForm({
      awb: waybill.awb,
      courier: waybill.courier,
      phoneNumber: waybill.phoneNumber,
    });
  };

  const handleSaveEdit = (id: string) => {
    if (editForm.awb && editForm.courier) {
      onUpdate(id, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
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
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Riwayat Resi</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {waybills.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Belum ada resi tersimpan</p>
              <p className="text-sm mt-1">
                Masukkan resi dan klik &quot;Simpan&quot; untuk menyimpan
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {waybills.map((waybill) => (
                <div key={waybill.id} className="border rounded-lg p-3 bg-card">
                  {editingId === waybill.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.awb || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            awb: e.target.value,
                          }))
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
                        value={editForm.phoneNumber || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
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
                          {formatDate(waybill.createdAt)}
                        </span>
                        {waybill.lastCheckedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Terakhir: {formatDate(waybill.lastCheckedAt)}
                          </span>
                        )}
                      </div>
                      {waybill.phoneNumber && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Telp: {waybill.phoneNumber}
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
