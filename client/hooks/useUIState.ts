"use client";

import { useState } from "react";

export function useUIState() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPrompted, setLoginPrompted] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | string | null>(null);

  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);

  return {
    isSidebarOpen,
    isLoginModalOpen,
    loginPrompted,
    deleteConfirmOpen,
    deleteTargetId,
    importConfirmOpen,
    importData,
    setIsSidebarOpen,
    setIsLoginModalOpen,
    setLoginPrompted,
    setDeleteConfirmOpen,
    setDeleteTargetId,
    setImportConfirmOpen,
    setImportData,
  };
}
