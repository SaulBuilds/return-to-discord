"use client";

import { useState } from "react";
import { usePrivy, useLogout, useLinkAccount } from "@privy-io/react-auth";
import {
  Shield,
  Bell,
  LogOut,
  Trash2,
  ExternalLink,
  Hash,
  Github,
  AlertCircle,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const {
    user: privyUser,
    getAccessToken,
    unlinkDiscord,
    unlinkTwitter,
    unlinkGithub,
  } = usePrivy();
  const { logout } = useLogout({
    onSuccess: () => {
      window.location.href = "/";
    },
  });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [unlinkingPlatform, setUnlinkingPlatform] = useState<string | null>(null);

  const syncToDb = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        await fetch("/api/auth/callback", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Failed to sync to DB:", err);
    }
  };

  const { linkDiscord, linkTwitter, linkGithub } = useLinkAccount({
    onSuccess: async () => {
      setLinkError(null);
      await syncToDb();
    },
    onError: (error) => {
      console.error("Link account error:", error);
      setLinkError("Failed to connect account. Make sure this login method is enabled in Privy.");
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
        `Failed to connect ${platform}. Make sure it's enabled in your Privy dashboard.`
      );
    }
  };

  const handleUnlink = async (platform: "discord" | "twitter" | "github", subject: string) => {
    setUnlinkingPlatform(platform);
    try {
      if (platform === "discord") await unlinkDiscord(subject);
      else if (platform === "twitter") await unlinkTwitter(subject);
      else if (platform === "github") await unlinkGithub(subject);
      await syncToDb();
    } catch (err) {
      console.error(`Failed to unlink ${platform}:`, err);
      setLinkError(`Failed to disconnect ${platform}. Please try again.`);
    } finally {
      setUnlinkingPlatform(null);
    }
  };

  const discordAccount = privyUser?.linkedAccounts?.find(
    (a) => a.type === "discord_oauth"
  );
  const twitterAccount = privyUser?.linkedAccounts?.find(
    (a) => a.type === "twitter_oauth"
  );
  const githubAccount = privyUser?.linkedAccounts?.find(
    (a) => a.type === "github_oauth"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getUsername = (account: any): string | null => {
    if (!account) return null;
    return account.username ?? null;
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-text-primary">Settings</h1>

      {linkError && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red/30 bg-red/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red" />
          <p className="text-sm text-red">{linkError}</p>
        </div>
      )}

      {/* Account */}
      <section className="mb-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Shield className="h-5 w-5 text-blurple" />
          Account
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-text-secondary">Email</p>
            <p className="text-text-primary">
              {privyUser?.email?.address ?? "No email linked"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">User ID</p>
            <p className="font-mono text-xs text-text-muted">
              {privyUser?.id ?? "\u2014"}
            </p>
          </div>
        </div>
      </section>

      {/* Linked Accounts */}
      <section className="mb-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <ExternalLink className="h-5 w-5 text-blurple" />
          Linked Accounts
        </h2>
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
                  {discordAccount
                    ? `Connected as ${getUsername(discordAccount) ?? "unknown"}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            {discordAccount ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-green">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <button
                  onClick={() => handleUnlink("discord", discordAccount.subject)}
                  disabled={unlinkingPlatform === "discord"}
                  className="rounded-lg border border-red/30 px-3 py-1.5 text-xs font-medium text-red hover:bg-red/10 disabled:opacity-50"
                >
                  {unlinkingPlatform === "discord" ? "Unlinking..." : "Unlink"}
                </button>
              </div>
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
                  {twitterAccount
                    ? `Connected as @${getUsername(twitterAccount) ?? "unknown"}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            {twitterAccount ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-green">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <button
                  onClick={() => handleUnlink("twitter", twitterAccount.subject)}
                  disabled={unlinkingPlatform === "twitter"}
                  className="rounded-lg border border-red/30 px-3 py-1.5 text-xs font-medium text-red hover:bg-red/10 disabled:opacity-50"
                >
                  {unlinkingPlatform === "twitter" ? "Unlinking..." : "Unlink"}
                </button>
              </div>
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
                  {githubAccount
                    ? `Connected as ${getUsername(githubAccount) ?? "unknown"}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            {githubAccount ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-green">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <button
                  onClick={() => handleUnlink("github", githubAccount.subject)}
                  disabled={unlinkingPlatform === "github"}
                  className="rounded-lg border border-red/30 px-3 py-1.5 text-xs font-medium text-red hover:bg-red/10 disabled:opacity-50"
                >
                  {unlinkingPlatform === "github" ? "Unlinking..." : "Unlink"}
                </button>
              </div>
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
      </section>

      {/* Notifications */}
      <section className="mb-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Bell className="h-5 w-5 text-blurple" />
          Notifications
        </h2>
        <p className="text-sm text-text-secondary">
          Notification preferences will be available in a future update. You
          currently receive all notifications by default.
        </p>
      </section>

      {/* Danger Zone */}
      <section className="rounded-xl border border-red/30 bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-red">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary">Sign Out</p>
            <p className="text-sm text-text-secondary">
              Sign out of your account on this device.
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface hover:text-red"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}
