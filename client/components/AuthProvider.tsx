"use client";

import { ReactNode } from "react";
import { AuthProvider as FirebaseAuthProvider } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}
