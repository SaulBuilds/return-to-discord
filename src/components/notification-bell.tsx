"use client";

import { useEffect, useState, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Bell, Check, UserPlus, MessageCircle, Compass, RefreshCw } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  FRIEND_REQUEST: UserPlus,
  FRIEND_ACCEPTED: Check,
  NEW_MESSAGE: MessageCircle,
  NEW_MATCH: Compass,
  SYNC_COMPLETE: RefreshCw,
};

export function NotificationBell() {
  const { getAccessToken } = usePrivy();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [getAccessToken]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      const token = await getAccessToken();
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-blurple hover:text-blurple-light"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = typeIcons[notif.type] ?? Bell;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface ${
                      !notif.read ? "bg-blurple/5" : ""
                    }`}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                      <Icon className="h-4 w-4 text-text-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-xs text-text-secondary">
                          {notif.body}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-text-muted">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blurple" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
