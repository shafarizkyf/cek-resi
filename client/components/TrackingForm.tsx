import { Search, Save, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Courier } from '@/types';

interface TrackingFormProps {
  couriers: Courier[];
  couriersLoading: boolean;
  trackingLoading: boolean;
  awbNumber: string;
  selectedCourier: string;
  phoneNumber?: string;
  error?: Error | null;
  isSaved?: boolean;
  onAwbChange: (value: string) => void;
  onCourierChange: (value: string) => void;
  onPhoneNumberChange?: (value: string) => void;
  onTrack: () => void;
  onSave?: () => void;
  onOpenHistory?: () => void;
}

export function TrackingForm({
  couriers,
  couriersLoading,
  trackingLoading,
  awbNumber,
  selectedCourier,
  phoneNumber,
  error,
  isSaved,
  onAwbChange,
  onCourierChange,
  onPhoneNumberChange,
  onTrack,
  onSave,
  onOpenHistory,
}: TrackingFormProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onTrack();
    }
  };

  const isDisabled = trackingLoading || couriersLoading || !awbNumber || !selectedCourier;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lacak Paket</CardTitle>
        <CardDescription>
          Masukkan nomor resi dan pilih kurir
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Masukkan nomor resi"
            value={awbNumber}
            onChange={(e) => onAwbChange(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          <Select value={selectedCourier} onValueChange={onCourierChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue
                placeholder={couriersLoading ? 'Loading...' : 'Pilih kurir'}
              />
            </SelectTrigger>
            <SelectContent>
              {couriers.map((courier) => (
                <SelectItem key={courier.code} value={courier.code}>
                  {courier.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="5 digit terakhir nomor telepon (opsional)"
            value={phoneNumber || ''}
            onChange={(e) => onPhoneNumberChange?.(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={handleKeyPress}
            maxLength={5}
            className="flex-1"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onTrack}
            disabled={isDisabled}
            className="flex-1"
          >
            {trackingLoading ? (
              'Mencari...'
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Lacak
              </>
            )}
          </Button>
          {onSave && (
            <Button
              variant="outline"
              onClick={onSave}
              disabled={!awbNumber || !selectedCourier || isSaved}
              title={isSaved ? 'Resi sudah tersimpan' : 'Simpan ke riwayat'}
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
          {onOpenHistory && (
            <Button variant="outline" onClick={onOpenHistory} title="Lihat riwayat">
              <History className="h-4 w-4" />
            </Button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : 'Terjadi kesalahan'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
