"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import {
  UserCheck,
  Clock,
  Send,
  MessageCircle,
  UserX,
  Check,
  X,
} from "lucide-react";

type Tab = "friends" | "pending" | "sent";

interface FriendItem {
  friendshipId: string;
  friend: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    discordUsername: string | null;
    twitterUsername: string | null;
  };
}

interface PendingItem {
  id: string;
  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    discordUsername: string | null;
  };
  createdAt: string;
}

interface SentItem {
  id: string;
  receiver: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    discordUsername: string | null;
  };
  createdAt: string;
}

export default function FriendsPage() {
  const { getAccessToken } = usePrivy();
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [sent, setSent] = useState<SentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (currentTab: Tab) => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/friends?tab=${currentTab}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (currentTab === "friends") setFriends(data.friends);
          if (currentTab === "pending") setPending(data.pending);
          if (currentTab === "sent") setSent(data.sent);
        }
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setLoading(false);
      }
    },
    [getAccessToken]
  );

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const handleAction = async (friendshipId: string, action: string) => {
    try {
      const token = await getAccessToken();
      await fetch("/api/friends", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendshipId, action }),
      });
      load(tab);
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  const tabs = [
    { id: "friends" as Tab, label: "Friends", icon: UserCheck, count: friends.length },
    { id: "pending" as Tab, label: "Pending", icon: Clock, count: pending.length },
    { id: "sent" as Tab, label: "Sent", icon: Send, count: sent.length },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-text-primary">Friends</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-surface p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-blurple text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : (
        <>
          {/* Friends list */}
          {tab === "friends" && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <UserCheck className="mx-auto mb-4 h-12 w-12 text-text-muted" />
                  <p className="text-text-secondary">
                    No friends yet.{" "}
                    <Link
                      href="/discover"
                      className="text-blurple hover:text-blurple-light"
                    >
                      Discover people
                    </Link>{" "}
                    to connect with.
                  </p>
                </div>
              ) : (
                friends.map((item) => (
                  <div
                    key={item.friendshipId}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                  >
                    <Link
                      href={`/profile/${item.friend.id}`}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-lg font-bold text-blurple-light">
                        {item.friend.displayName?.charAt(0)?.toUpperCase() ??
                          "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {item.friend.displayName ?? "Unknown"}
                        </p>
                        <p className="text-sm text-text-muted">
                          {item.friend.discordUsername &&
                            `Discord: ${item.friend.discordUsername}`}
                          {item.friend.twitterUsername &&
                            ` · @${item.friend.twitterUsername}`}
                        </p>
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      <Link
                        href={`/messages/${item.friend.id}`}
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() =>
                          handleAction(item.friendshipId, "remove")
                        }
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-red/10 hover:text-red hover:border-red/30"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pending requests */}
          {tab === "pending" && (
            <div className="space-y-3">
              {pending.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <Clock className="mx-auto mb-4 h-12 w-12 text-text-muted" />
                  <p className="text-text-secondary">
                    No pending friend requests.
                  </p>
                </div>
              ) : (
                pending.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                  >
                    <Link
                      href={`/profile/${item.sender.id}`}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-lg font-bold text-blurple-light">
                        {item.sender.displayName?.charAt(0)?.toUpperCase() ??
                          "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {item.sender.displayName ?? "Unknown"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(item.id, "accept")}
                        className="flex items-center gap-2 rounded-lg bg-green/10 px-4 py-2 text-sm font-medium text-green hover:bg-green/20"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(item.id, "decline")}
                        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-red/10 hover:text-red"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sent requests */}
          {tab === "sent" && (
            <div className="space-y-3">
              {sent.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <Send className="mx-auto mb-4 h-12 w-12 text-text-muted" />
                  <p className="text-text-secondary">
                    No sent friend requests.
                  </p>
                </div>
              ) : (
                sent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                  >
                    <Link
                      href={`/profile/${item.receiver.id}`}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-lg font-bold text-blurple-light">
                        {item.receiver.displayName?.charAt(0)?.toUpperCase() ??
                          "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {item.receiver.displayName ?? "Unknown"}
                        </p>
                        <p className="text-xs text-text-muted">
                          Sent {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-text-muted">
                      Pending
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
