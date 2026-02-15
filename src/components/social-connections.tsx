"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePrivy, useLinkAccount } from "@privy-io/react-auth";
import { useSync } from "@/hooks/use-sync";
import { Hash, ExternalLink, Github, Check, RefreshCw, AlertCircle } from "lucide-react";

export function SocialConnections() {
  const [mounted, setMounted] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const { user, getAccessToken, authenticated } = usePrivy();
  const { syncing, sync } = useSync();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync Privy linked accounts to DB whenever user object changes
  // This catches OAuth redirects where onSuccess may not fire
  const syncToDb = useCallback(async () => {
    if (!authenticated) return;
    try {
      const token = await getAccessToken();
      if (token) {
        await fetch("/api/auth/callback", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Failed to sync accounts to DB:", err);
    }
  }, [authenticated, getAccessToken]);

  // On mount and whenever Privy user changes, sync linked accounts to DB
  useEffect(() => {
    if (!authenticated || !user) return;

    // Build a fingerprint of linked account types to detect changes
    const linkedTypes = user.linkedAccounts
      ?.map((a) => a.type)
      .sort()
      .join(",") ?? "";

    // Always sync on first mount (handles OAuth redirect return)
    if (!hasSyncedRef.current) {
      hasSyncedRef.current = true;
      syncToDb();
      return;
    }

    // Sync when linked accounts change
    syncToDb();
  }, [authenticated, user, syncToDb]);

  const { linkDiscord, linkTwitter, linkGithub } = useLinkAccount({
    onSuccess: async () => {
      setLinkError(null);
      // Persist to DB and sync data
      try {
        await syncToDb();
        await sync();
      } catch (err) {
        console.error("Failed to sync after linking:", err);
      }
    },
    onError: (error) => {
      console.error("Link account error:", error);
      const msg = typeof error === "string" ? error : (error as { message?: string })?.message;
      if (msg?.includes("not configured") || msg?.includes("not enabled")) {
        setLinkError("This login method is not enabled. Configure it in the Privy dashboard.");
      } else {
        setLinkError("Failed to connect account. Please try again.");
      }
    },
  });

  const handleLink = (platform: "discord" | "twitter" | "github") => {
    setLinkError(null);
    try {
      if (platform === "discord") linkDiscord();
      else if (platform === "twitter") linkTwitter();
      else if (platform === "github") linkGithub();
    } catch (err) {
      console.error(`Failed to start ${platform} linking:`, err);
      setLinkError(
        `Failed to connect ${platform}. Make sure ${platform} is enabled in your Privy dashboard settings.`
      );
    }
  };

  const discord = user?.linkedAccounts?.find(
    (a) => a.type === "discord_oauth"
  );
  const twitter = user?.linkedAccounts?.find(
    (a) => a.type === "twitter_oauth"
  );
  const github = user?.linkedAccounts?.find((a) => a.type === "github_oauth");

  const discordUsername =
    discord && "username" in discord ? discord.username : null;
  const twitterUsername =
    twitter && "username" in twitter ? twitter.username : null;
  const githubUsername =
    github && "username" in github ? github.username : null;

  const connectedCount = [discord, twitter, github].filter(Boolean).length;

  if (!mounted || !authenticated) {
    return (
      <div className="h-64 animate-pulse rounded-xl bg-card" />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Connect Your Accounts
          </h3>
          <p className="text-sm text-text-secondary">
            {connectedCount}/3 platforms linked
          </p>
        </div>
        {connectedCount > 0 && (
          <button
            onClick={() => sync()}
            disabled={syncing}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync"}
          </button>
        )}
      </div>

      {linkError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red" />
          <p className="text-sm text-red">{linkError}</p>
        </div>
      )}

      {connectedCount === 0 && (
        <p className="mb-4 text-sm text-text-muted">
          Link your social accounts to start discovering friends across
          platforms.
        </p>
      )}

      <div className="space-y-3">
        {/* Discord */}
        <div className="flex items-center justify-between rounded-lg bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5865F2]">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Discord</p>
              <p className="text-sm text-text-secondary">
                {discordUsername ?? "Not connected"}
              </p>
            </div>
          </div>
          {discord ? (
            <span className="flex items-center gap-1.5 rounded-full bg-green/10 px-3 py-1 text-xs font-medium text-green">
              <Check className="h-3.5 w-3.5" />
              Connected
            </span>
          ) : (
            <button
              onClick={() => handleLink("discord")}
              className="rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4752C4]"
            >
              Connect
            </button>
          )}
        </div>

        {/* Twitter */}
        <div className="flex items-center justify-between rounded-lg bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Twitter / X</p>
              <p className="text-sm text-text-secondary">
                {twitterUsername ? `@${twitterUsername}` : "Not connected"}
              </p>
            </div>
          </div>
          {twitter ? (
            <span className="flex items-center gap-1.5 rounded-full bg-green/10 px-3 py-1 text-xs font-medium text-green">
              <Check className="h-3.5 w-3.5" />
              Connected
            </span>
          ) : (
            <button
              onClick={() => handleLink("twitter")}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Connect
            </button>
          )}
        </div>

        {/* GitHub */}
        <div className="flex items-center justify-between rounded-lg bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#24292e]">
              <Github className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-text-primary">GitHub</p>
              <p className="text-sm text-text-secondary">
                {githubUsername ?? "Not connected"}
              </p>
            </div>
          </div>
          {github ? (
            <span className="flex items-center gap-1.5 rounded-full bg-green/10 px-3 py-1 text-xs font-medium text-green">
              <Check className="h-3.5 w-3.5" />
              Connected
            </span>
          ) : (
            <button
              onClick={() => handleLink("github")}
              className="rounded-lg bg-[#24292e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3b434b]"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
