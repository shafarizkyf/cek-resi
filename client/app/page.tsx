"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, Package, Truck, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Courier {
  code: string;
  description: string;
}

interface TrackingSummary {
  awb: string;
  courier: string;
  status: string;
  date: string;
}

interface TrackingDetail {
  origin: string;
  destination: string;
  shipper: string;
  receiver: string;
}

interface TrackingEvent {
  date: string;
  desc: string;
  location: string;
}

interface TrackingData {
  summary: TrackingSummary;
  detail: TrackingDetail;
  history: TrackingEvent[];
}

interface ApiResponse {
  status: number;
  data?: {
    summary: TrackingSummary;
    detail: TrackingDetail;
    history: TrackingEvent[];
  };
  message?: string;
  error?: string;
}

function useCouriers() {
  return useQuery<Courier[]>({
    queryKey: ["couriers"],
    queryFn: async () => {
      const res = await fetch("/api/couriers");
      return res.json();
    },
  });
}

function useTracking(courier: string, awb: string) {
  return useQuery<TrackingData | null>({
    queryKey: ["tracking", courier, awb],
    queryFn: async () => {
      if (!courier || !awb) return null;
      const res = await fetch(`/api/track?courier=${courier}&awb=${awb}`);
      const data: ApiResponse = await res.json();

      if (res.status === 522) {
        throw new Error("Layanan sedang gangguan, coba lagi nanti");
      }
      if (res.status === 404) {
        throw new Error("Nomor resi tidak ditemukan");
      }
      if (res.status === 401) {
        throw new Error("Konfigurasi API tidak valid");
      }
      if (res.status === 422) {
        throw new Error("Kurir tidak valid");
      }
      if (!res.ok || data.status !== 200) {
        throw new Error(data.message || "Gagal mengambil data");
      }
      if (data.data) {
        return {
          summary: data.data.summary,
          detail: data.data.detail,
          history: data.data.history || [],
        };
      }
      throw new Error(data.message || "Tracking data not found");
    },
    enabled: false,
    placeholderData: keepPreviousData,
  });
}

export default function Home() {
  const [awbNumber, setAwbNumber] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");

  const { data: couriers = [], isLoading: couriersLoading } = useCouriers();
  const {
    data: trackingData,
    isLoading: trackingLoading,
    error,
    refetch,
  } = useTracking(selectedCourier, awbNumber);

  const handleTrack = () => {
    if (awbNumber && selectedCourier) {
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTrack();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Cek Resi</h1>
          <p className="text-slate-600">
            Lacak paket dari berbagai kurir Indonesia
          </p>
        </div>

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
                onChange={(e) => setAwbNumber(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Select
                value={selectedCourier}
                onValueChange={setSelectedCourier}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue
                    placeholder={couriersLoading ? "Loading..." : "Pilih kurir"}
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
            <Button
              onClick={handleTrack}
              disabled={
                trackingLoading ||
                couriersLoading ||
                !awbNumber ||
                !selectedCourier
              }
              className="w-full"
            >
              {trackingLoading ? (
                "Mencari..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Lacak
                </>
              )}
            </Button>
            {error && (
              <p className="text-sm text-red-500">
                {error instanceof Error ? error.message : "Terjadi kesalahan"}
              </p>
            )}
          </CardContent>
        </Card>

        {trackingData && !trackingLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {trackingData.summary.courier.toUpperCase()} -{" "}
                {trackingData.summary.awb}
              </CardTitle>
              <CardDescription>
                Status:{" "}
                <span className="font-medium text-green-600">
                  {trackingData.summary.status}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Pengirim
                  </p>
                  <p className="font-medium">
                    {trackingData.detail.shipper || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {trackingData.detail.origin || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Penerima
                  </p>
                  <p className="font-medium">
                    {trackingData.detail.receiver || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {trackingData.detail.destination || "-"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Riwayat Pengiriman
                </h3>
                <div className="space-y-4">
                  {trackingData.history.length > 0 ? (
                    trackingData.history.map((event, index) => (
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
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
