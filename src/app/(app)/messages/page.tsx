"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface Conversation {
  partner: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    discordUsername: string | null;
  } | null;
  latestMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const { getAccessToken } = usePrivy();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations);
        }
      } catch (err) {
        console.error("Failed to load inbox:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getAccessToken]);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-text-primary">Messages</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-text-muted" />
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            No Messages Yet
          </h3>
          <p className="text-text-secondary">
            Add friends and start a conversation from their profile.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            if (!conv.partner) return null;
            return (
              <Link
                key={conv.partner.id}
                href={`/messages/${conv.partner.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card-hover"
              >
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-lg font-bold text-blurple-light">
                    {conv.partner.displayName?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1 text-[10px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-text-primary">
                      {conv.partner.displayName ?? "Unknown"}
                    </p>
                    {conv.latestMessage && (
                      <span className="text-xs text-text-muted">
                        {new Date(
                          conv.latestMessage.createdAt
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {conv.latestMessage && (
                    <p className="truncate text-sm text-text-secondary">
                      {conv.latestMessage.content}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
