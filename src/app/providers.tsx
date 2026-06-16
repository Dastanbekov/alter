"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--surface-3)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "transparent" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "transparent" },
          },
        }}
      />
    </SessionProvider>
  );
}
