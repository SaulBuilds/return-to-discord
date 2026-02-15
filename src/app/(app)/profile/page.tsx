"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSync } from "@/hooks/use-sync";
import {
  RefreshCw,
  Save,
  ExternalLink,
  Calendar,
  Users,
  Hash,
} from "lucide-react";

interface ProfileData {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  discordUsername: string | null;
  twitterUsername: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  guildCount: number;
  friendCount: number;
  guilds?: { id: string; name: string; icon: string | null }[];
}

export default function ProfilePage() {
  const { user: privyUser, getAccessToken, linkDiscord, linkTwitter } =
    usePrivy();
  const { syncing, sync } = useSync();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessToken();
        // We need to fetch own profile - get user ID first from auth callback
        const callbackRes = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!callbackRes.ok) return;
        const { user } = await callbackRes.json();

        const res = await fetch(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setForm({
            displayName: data.user.displayName ?? "",
            bio: data.user.bio ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getAccessToken]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/users/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => (prev ? { ...prev, ...data.user } : null));
        setEditing(false);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      await sync();
      // Reload profile to get updated guild count
      const token = await getAccessToken();
      if (profile) {
        const res = await fetch(`/api/users/${profile.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        }
      }
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-card" />
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-text-secondary">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Your Profile</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 rounded-lg bg-blurple px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blurple-hover disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
          />
          {syncing ? "Syncing..." : "Sync Accounts"}
        </button>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-3xl font-bold text-blurple-light">
            {profile.displayName?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, displayName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">
                    Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bio: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary"
                    rows={3}
                    maxLength={500}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-blurple px-4 py-2 text-sm font-medium text-white hover:bg-blurple-hover disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-text-primary">
                    {profile.displayName ?? "No Name Set"}
                  </h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-text-secondary hover:bg-surface"
                  >
                    Edit
                  </button>
                </div>
                {profile.bio && (
                  <p className="mt-2 text-text-secondary">{profile.bio}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">
              {profile.friendCount}
            </p>
            <p className="text-sm text-text-muted">Friends</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">
              {profile.guildCount}
            </p>
            <p className="text-sm text-text-muted">Servers</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-muted">
              <Calendar className="mb-1 inline h-4 w-4" /> Joined{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Linked Accounts */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Linked Accounts
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5865F2]">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Discord</p>
                <p className="text-sm text-text-secondary">
                  {profile.discordUsername ?? "Not linked"}
                </p>
              </div>
            </div>
            {!profile.discordUsername && (
              <button
                onClick={() => linkDiscord()}
                className="rounded-lg bg-blurple px-4 py-2 text-sm font-medium text-white hover:bg-blurple-hover"
              >
                Link
              </button>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Twitter</p>
                <p className="text-sm text-text-secondary">
                  {profile.twitterUsername
                    ? `@${profile.twitterUsername}`
                    : "Not linked"}
                </p>
              </div>
            </div>
            {!profile.twitterUsername && (
              <button
                onClick={() => linkTwitter()}
                className="rounded-lg bg-blurple px-4 py-2 text-sm font-medium text-white hover:bg-blurple-hover"
              >
                Link
              </button>
            )}
          </div>
        </div>
        {profile.lastSyncedAt && (
          <p className="mt-4 text-xs text-text-muted">
            Last synced: {new Date(profile.lastSyncedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Guilds list */}
      {profile.guilds && profile.guilds.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Your Servers ({profile.guilds.length})
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {profile.guilds.map((guild) => (
              <div
                key={guild.id}
                className="flex items-center gap-3 rounded-lg bg-surface p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blurple/20 text-xs font-bold text-blurple-light">
                  {guild.name.charAt(0)}
                </div>
                <span className="truncate text-sm font-medium text-text-secondary">
                  {guild.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
