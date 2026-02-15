"use client";

import { usePrivy } from "@privy-io/react-auth";
import {
  Shield,
  Bell,
  LogOut,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const { logout, user: privyUser, unlinkDiscord, unlinkTwitter } = usePrivy();

  const discordAccount = privyUser?.linkedAccounts?.find(
    (a) => a.type === "discord_oauth"
  );
  const twitterAccount = privyUser?.linkedAccounts?.find(
    (a) => a.type === "twitter_oauth"
  );

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-text-primary">Settings</h1>

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
              {privyUser?.id ?? "—"}
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
          <div className="flex items-center justify-between rounded-lg bg-surface p-4">
            <div>
              <p className="font-medium text-text-primary">Discord</p>
              <p className="text-sm text-text-secondary">
                {discordAccount
                  ? `Connected as ${
                      "username" in discordAccount
                        ? (discordAccount as { username: string }).username
                        : "unknown"
                    }`
                  : "Not connected"}
              </p>
            </div>
            {discordAccount && (
              <button
                onClick={() => unlinkDiscord(discordAccount.subject)}
                className="rounded-lg border border-red/30 px-3 py-1.5 text-xs font-medium text-red hover:bg-red/10"
              >
                Unlink
              </button>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface p-4">
            <div>
              <p className="font-medium text-text-primary">Twitter</p>
              <p className="text-sm text-text-secondary">
                {twitterAccount
                  ? `Connected as @${
                      "username" in twitterAccount
                        ? (twitterAccount as { username: string }).username
                        : "unknown"
                    }`
                  : "Not connected"}
              </p>
            </div>
            {twitterAccount && (
              <button
                onClick={() => unlinkTwitter(twitterAccount.subject)}
                className="rounded-lg border border-red/30 px-3 py-1.5 text-xs font-medium text-red hover:bg-red/10"
              >
                Unlink
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Privacy */}
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
