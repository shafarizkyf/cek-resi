import { MapPin } from 'lucide-react';
import { TrackingDetail } from '@/types';

interface ShipmentInfoProps {
  detail: TrackingDetail;
}

export function ShipmentInfo({ detail }: ShipmentInfoProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> Pengirim
        </p>
        <p className="font-medium">
          {detail.shipper || '-'}
        </p>
        <p className="text-sm text-muted-foreground">
          {detail.origin || '-'}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> Penerima
        </p>
        <p className="font-medium">
          {detail.receiver || '-'}
        </p>
        <p className="text-sm text-muted-foreground">
          {detail.destination || '-'}
        </p>
      </div>
    </div>
  );
}
