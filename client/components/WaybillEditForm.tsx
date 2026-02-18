"use client";

import { Check } from "lucide-react";
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

interface WaybillEditFormProps {
  initialData: {
    awb: string;
    courier: string;
    phoneNumber: string;
  };
  couriers: Courier[];
  onChange: (data: {
    awb: string;
    courier: string;
    phoneNumber: string;
  }) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function WaybillEditForm({
  initialData,
  couriers,
  onChange,
  onSave,
  onCancel,
}: WaybillEditFormProps) {
  return (
    <div className="space-y-3">
      <Input
        value={initialData.awb}
        onChange={(e) => onChange({ ...initialData, awb: e.target.value })}
        placeholder="Nomor Resi"
      />
      <Select
        value={initialData.courier}
        onValueChange={(value) => onChange({ ...initialData, courier: value })}
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
        value={initialData.phoneNumber}
        onChange={(e) =>
          onChange({ ...initialData, phoneNumber: e.target.value })
        }
        placeholder="5 digit terakhir nomor telephon (opsional)"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} className="flex-1">
          <Check className="h-4 w-4 mr-1" />
          Simpan
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  );
}
