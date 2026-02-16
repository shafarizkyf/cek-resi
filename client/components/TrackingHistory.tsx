import { Truck, MapPin, Clock } from 'lucide-react';
import { TrackingEvent } from '@/types';

interface TrackingHistoryProps {
  history: TrackingEvent[];
}

export function TrackingHistory({ history }: TrackingHistoryProps) {
  return (
    <div className="border-t pt-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Truck className="h-4 w-4" />
        Riwayat Pengiriman
      </h3>
      <div className="space-y-4">
        {history.length > 0 ? (
          history.map((event, index) => (
            <div
              key={index}
              className="flex gap-4 relative last:before:hidden before:absolute before:left-[11px] before:top-4 before:h-full before:w-px before:bg-border"
            >
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-3 w-3 text-primary" />
                </div>
              </div>
              <div className="flex-1 space-y-1 pb-4">
                <p className="font-medium text-sm">{event.desc}</p>
                <p className="text-xs text-muted-foreground">
                  {event.date}
                </p>
                {event.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Tidak ada riwayat pengiriman
          </p>
        )}
      </div>
    </div>
  );
}
