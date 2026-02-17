'use client';

import { useState } from 'react';
import { useCouriers } from '@/hooks/useCouriers';
import { useTracking } from '@/hooks/useTracking';
import { TrackingHeader } from '@/components/TrackingHeader';
import { TrackingForm } from '@/components/TrackingForm';
import { TrackingResult } from '@/components/TrackingResult';

export default function Home() {
  const [awbNumber, setAwbNumber] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const { data: couriers = [], isLoading: couriersLoading } = useCouriers();
  const {
    data: trackingData,
    isLoading: trackingLoading,
    error,
    refetch,
  } = useTracking(selectedCourier, awbNumber, phoneNumber);

  const handleTrack = () => {
    if (awbNumber && selectedCourier) {
      refetch();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <TrackingHeader />

        <TrackingForm
          couriers={couriers}
          couriersLoading={couriersLoading}
          trackingLoading={trackingLoading}
          awbNumber={awbNumber}
          selectedCourier={selectedCourier}
          phoneNumber={phoneNumber}
          error={error}
          onAwbChange={setAwbNumber}
          onCourierChange={setSelectedCourier}
          onPhoneNumberChange={setPhoneNumber}
          onTrack={handleTrack}
        />

        {trackingData && !trackingLoading && (
          <TrackingResult data={trackingData} />
        )}
      </div>
    </main>
  );
}
