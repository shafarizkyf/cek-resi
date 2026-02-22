export interface WaybillBase {
  id: number | string;
  awb: string;
  courier: string;
  phoneNumber?: string | null;
  createdAt?: string | null;
  lastCheckedAt?: string | null;
}

export interface Waybill extends WaybillBase {
  userId: string;
  pollingEnabled: boolean;
  pollingIntervalHours: number;
  lastStatus: string | null;
  statusDetail: string | null;
  hasUpdate: boolean;
  updatedAt: string;
}

export interface LocalWaybill extends WaybillBase {}

export interface Courier {
  code: string;
  description: string;
}

export interface TrackingSummary {
  awb: string;
  courier: string;
  status: string;
  date: string;
}

export interface TrackingDetail {
  origin: string;
  destination: string;
  shipper: string;
  receiver: string;
}

export interface TrackingEvent {
  date: string;
  desc: string;
  location: string;
}

export interface TrackingData {
  summary: TrackingSummary;
  detail: TrackingDetail;
  history: TrackingEvent[];
}

export interface ApiResponse {
  status: number;
  data?: {
    summary: TrackingSummary;
    detail: TrackingDetail;
    history: TrackingEvent[];
  };
  message?: string;
  error?: string;
}
