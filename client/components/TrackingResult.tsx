import { Package } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrackingData } from '@/types';
import { ShipmentInfo } from './ShipmentInfo';
import { TrackingHistory } from './TrackingHistory';

interface TrackingResultProps {
  data: TrackingData;
}

export function TrackingResult({ data }: TrackingResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {data.summary.courier.toUpperCase()} -{' '}
          {data.summary.awb}
        </CardTitle>
        <CardDescription>
          Status:{' '}
          <span className="font-medium text-green-600">
            {data.summary.status}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ShipmentInfo detail={data.detail} />
        <TrackingHistory history={data.history} />
      </CardContent>
    </Card>
  );
}
