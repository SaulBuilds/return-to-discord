"use client";

import { useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface SyncState {
  syncing: boolean;
  error: string | null;
  lastResult: {
    guildssynced: number;
    twitterConnectionsSynced: number;
  } | null;
}

export function useSync() {
  const { getAccessToken } = usePrivy();
  const [state, setState] = useState<SyncState>({
    syncing: false,
    error: null,
    lastResult: null,
  });

  const sync = useCallback(
    async (opts?: {
      discordAccessToken?: string;
      twitterAccessToken?: string;
      twitterUserId?: string;
    }) => {
      setState((prev) => ({ ...prev, syncing: true, error: null }));

      try {
        const token = await getAccessToken();
        const response = await fetch("/api/users/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(opts ?? {}),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Sync failed");
        }

        const result = await response.json();
        setState({
          syncing: false,
          error: null,
          lastResult: result,
        });
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Sync failed";
        setState((prev) => ({ ...prev, syncing: false, error: message }));
        throw error;
      }
    },
    [getAccessToken]
  );

  return { ...state, sync };
}
