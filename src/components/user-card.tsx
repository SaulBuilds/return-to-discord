"use client";

import Link from "next/link";
import { ConnectionBadge } from "./connection-badge";
import type { MatchedUser } from "@/lib/matching";

interface UserCardProps {
  user: MatchedUser;
  onAddFriend?: (userId: string) => void;
  showAddFriend?: boolean;
}

export function UserCard({
  user,
  onAddFriend,
  showAddFriend = true,
}: UserCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card-hover">
      <div className="flex items-start justify-between">
        <Link href={`/profile/${user.id}`} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-lg font-bold text-blurple-light">
            {user.displayName?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary group-hover:text-blurple-light transition-colors">
              {user.displayName ?? "Unknown User"}
            </h3>
            <div className="flex items-center gap-3 text-sm text-text-muted">
              {user.discordUsername && (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  {user.discordUsername}
                </span>
              )}
              {user.twitterUsername && (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  @{user.twitterUsername}
                </span>
              )}
            </div>
          </div>
        </Link>
        <ConnectionBadge score={user.score} />
      </div>

      {/* Shared guilds */}
      {user.sharedGuilds.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            Shared Servers
          </p>
          <div className="flex flex-wrap gap-2">
            {user.sharedGuilds.slice(0, 5).map((guild) => (
              <span
                key={guild.id}
                className="rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary"
              >
                {guild.name}
              </span>
            ))}
            {user.sharedGuilds.length > 5 && (
              <span className="rounded-md bg-surface px-2.5 py-1 text-xs text-text-muted">
                +{user.sharedGuilds.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Twitter relation */}
      {user.twitterRelation !== "none" && (
        <div className="mt-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
              {
                "bg-green/10 text-green": user.twitterRelation === "mutual",
                "bg-blurple/10 text-blurple-light":
                  user.twitterRelation === "following",
                "bg-surface text-text-secondary":
                  user.twitterRelation === "follower",
              }
            )}
          >
            {user.twitterRelation === "mutual" && "Mutual Follow"}
            {user.twitterRelation === "following" && "You Follow"}
            {user.twitterRelation === "follower" && "Follows You"}
          </span>
        </div>
      )}

      {/* Actions */}
      {showAddFriend && onAddFriend && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onAddFriend(user.id)}
            className="rounded-lg bg-blurple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blurple-hover"
          >
            Add Friend
          </button>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | Record<string, boolean> | undefined)[]) {
  return classes
    .flatMap((c) => {
      if (!c) return [];
      if (typeof c === "string") return [c];
      return Object.entries(c)
        .filter(([, v]) => v)
        .map(([k]) => k);
    })
    .join(" ");
}
