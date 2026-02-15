"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";
import { getPusherClient, getConversationChannel } from "@/lib/pusher";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export default function ConversationPage() {
  const { id: partnerId } = useParams<{ id: string }>();
  const { getAccessToken, user: privyUser } = usePrivy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessToken();

        // Get current user ID
        const callbackRes = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (callbackRes.ok) {
          const { user } = await callbackRes.json();
          setCurrentUserId(user.id);
        }

        // Load partner info
        const partnerRes = await fetch(`/api/users/${partnerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (partnerRes.ok) {
          const data = await partnerRes.json();
          setPartnerName(data.user.displayName);
        }

        // Load messages
        const res = await fetch(`/api/messages?partnerId=${partnerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [partnerId, getAccessToken]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!currentUserId) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(
      getConversationChannel(currentUserId, partnerId)
    );

    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getConversationChannel(currentUserId, partnerId));
    };
  }, [currentUserId, partnerId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (content: string) => {
    try {
      const token = await getAccessToken();
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: partnerId, content }),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-3rem)] flex-col rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-4 py-3">
        <Link
          href="/messages"
          className="rounded-lg p-2 text-text-secondary hover:bg-surface md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-lg font-bold text-blurple-light">
          {partnerName?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="font-semibold text-text-primary">
            {partnerName ?? "Loading..."}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-text-muted">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-text-muted">
              No messages yet. Send one to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              senderName={msg.sender.displayName}
              isOwn={msg.senderId === currentUserId}
              timestamp={msg.createdAt}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}
