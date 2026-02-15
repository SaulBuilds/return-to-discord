"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { type ReactNode } from "react";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function Providers({ children }: { children: ReactNode }) {
  if (!privyAppId) {
    // During build / SSG when no env is set, just render children
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#5865F2",
        },
        loginMethods: ["email", "google", "discord", "twitter"],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
