"use client";

import { useState } from "react";

export function useTrackingForm() {
  const [awbNumber, setAwbNumber] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const reset = () => {
    setAwbNumber("");
    setSelectedCourier("");
    setPhoneNumber("");
  };

  return {
    awbNumber,
    selectedCourier,
    phoneNumber,
    setAwbNumber,
    setSelectedCourier,
    setPhoneNumber,
    reset,
  };
}
