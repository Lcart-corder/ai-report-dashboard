"use client";

import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreProvider>
        <ToastProvider>{children}</ToastProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
