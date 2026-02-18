"use client";

import { useState, useEffect } from "react";
import { useCouriers } from "@/hooks/useCouriers";
import { useTracking } from "@/hooks/useTracking";
import { useSavedWaybills, SavedWaybill } from "@/hooks/useSavedWaybills";
import { TrackingHeader } from "@/components/TrackingHeader";
import { TrackingForm } from "@/components/TrackingForm";
import { TrackingResult } from "@/components/TrackingResult";
import { SavedWaybillsSidebar } from "@/components/SavedWaybillsSidebar";
import { GithubIcon } from "@/components/GithubIcon";

export default function Home() {
  const [awbNumber, setAwbNumber] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: couriers = [], isLoading: couriersLoading } = useCouriers();
  const {
    waybills,
    saveWaybill,
    updateWaybill,
    deleteWaybill,
    markAsChecked,
    isWaybillSaved,
  } = useSavedWaybills();

  const {
    data: trackingData,
    isLoading: trackingLoading,
    error,
    refetch,
  } = useTracking(selectedCourier, awbNumber, phoneNumber);

  const isCurrentWaybillSaved = isWaybillSaved(awbNumber, selectedCourier);

  const handleTrack = () => {
    if (awbNumber && selectedCourier) {
      const existingWaybill = waybills.find(
        (wb) => wb.awb === awbNumber && wb.courier === selectedCourier
      );
      if (existingWaybill) {
        markAsChecked(existingWaybill.id);
      }
      refetch();
    }
  };

  const handleSave = () => {
    if (awbNumber && selectedCourier) {
      saveWaybill({
        awb: awbNumber,
        courier: selectedCourier,
        phoneNumber: phoneNumber || undefined,
      });
    }
  };

  const handleSelectWaybill = (waybill: SavedWaybill) => {
    setAwbNumber(waybill.awb);
    setSelectedCourier(waybill.courier);
    setPhoneNumber(waybill.phoneNumber || "");
    setIsSidebarOpen(false);
    setTimeout(() => {
      markAsChecked(waybill.id);
      refetch();
    }, 100);
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
          isSaved={isCurrentWaybillSaved}
          onAwbChange={setAwbNumber}
          onCourierChange={setSelectedCourier}
          onPhoneNumberChange={setPhoneNumber}
          onTrack={handleTrack}
          onSave={handleSave}
          onOpenHistory={() => setIsSidebarOpen(true)}
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

      <SavedWaybillsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        waybills={waybills}
        onDelete={deleteWaybill}
        onUpdate={updateWaybill}
        onSelect={handleSelectWaybill}
        couriers={couriers}
      />
    </main>
  );
}
