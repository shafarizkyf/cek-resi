"use client";

import { Trash2, Edit2, Clock, Calendar, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Waybill, LocalWaybill } from "@/types";

export type WaybillData = Waybill | LocalWaybill;

interface WaybillItemProps {
  waybill: WaybillData;
  getCourierName: (code: string) => string;
  formatDate: (dateString?: string | null) => string;
  getPhoneNumber: (waybill: WaybillData) => string | null | undefined;
  getCreatedAt: (waybill: WaybillData) => string | null | undefined;
  getLastCheckedAt: (waybill: WaybillData) => string | null | undefined;
  getPollingEnabled: (waybill: WaybillData) => boolean;
  getHasUpdate: (waybill: WaybillData) => boolean;
  isDeleteConfirm: boolean;
  onTogglePolling: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}

export function WaybillItem({
  waybill,
  getCourierName,
  formatDate,
  getPhoneNumber,
  getCreatedAt,
  getLastCheckedAt,
  getPollingEnabled,
  getHasUpdate,
  isDeleteConfirm,
  onTogglePolling,
  onEdit,
  onDelete,
  onSelect,
}: WaybillItemProps) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div
          className="cursor-pointer flex-1"
          onClick={onSelect}
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
            onClick={onTogglePolling}
            title={getPollingEnabled(waybill) ? "Nonaktifkan notifikasi" : "Aktifkan notifikasi"}
          >
            {getPollingEnabled(waybill) ? (
              <Bell className="h-4 w-4 text-green-500" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${
              isDeleteConfirm ? "text-red-500 hover:text-red-600" : ""
            }`}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(getCreatedAt(waybill))}
        </span>
        {getLastCheckedAt(waybill) && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Terakhir: {formatDate(getLastCheckedAt(waybill))}
          </span>
        )}
      </div>
      {getPhoneNumber(waybill) && (
        <p className="text-xs text-muted-foreground mt-1">
          Telp: {getPhoneNumber(waybill)}
        </p>
      )}
      {getHasUpdate(waybill) && (
        <p className="text-xs text-green-600 font-medium mt-1">
          Ada pembaruan status!
        </p>
      )}
      <Button
        size="sm"
        variant="outline"
        className="w-full mt-2"
        onClick={onSelect}
      >
        Lacak Sekarang
      </Button>
    </>
  );
}
