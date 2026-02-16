export interface Courier {
  code: string;
  description: string;
}

export interface TrackingEvent {
  date: string;
  desc: string;
  location: string;
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

export interface TrackingData {
  status: number;
  data?: {
    summary: TrackingSummary;
    detail: TrackingDetail;
    history: TrackingEvent[];
  };
  message?: string;
}

export interface ApiError {
  status: number | string;
  message: string;
}
