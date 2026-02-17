"use client";

import { useState } from "react";
import { useCouriers } from "@/hooks/useCouriers";
import { useTracking } from "@/hooks/useTracking";
import { TrackingHeader } from "@/components/TrackingHeader";
import { TrackingForm } from "@/components/TrackingForm";
import { TrackingResult } from "@/components/TrackingResult";
import { GithubIcon } from "@/components/GithubIcon";

export default function Home() {
  const [awbNumber, setAwbNumber] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <a
          href="https://github.com/shafarizkyf/cek-resi"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <GithubIcon className="w-6 h-6" />
        </a>

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

        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>
            This service uses a third-party API to track shipments. No tracking
            data is stored on our servers.
          </p>
          <p className="mt-1">
            The backend server acts only as a proxy to communicate with the
            third-party provider.
          </p>
        </footer>
      </div>
    </main>
  );
}
