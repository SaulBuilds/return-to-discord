"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { type ReactNode, useEffect, useState } from "react";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR/SSG or when no Privy app ID is configured, render children without Privy
  if (!mounted || !privyAppId) {
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
        loginMethods: ["email", "google", "discord", "twitter", "github"],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
