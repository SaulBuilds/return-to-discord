"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { ConnectionBadge } from "@/components/connection-badge";
import {
  UserPlus,
  UserCheck,
  Clock,
  Ban,
  MessageCircle,
  Calendar,
  Hash,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  discordUsername: string | null;
  twitterUsername: string | null;
  createdAt: string;
  guildCount: number;
  friendCount: number;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { getAccessToken } = usePrivy();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setFriendshipStatus(data.friendshipStatus);
          setIsOwnProfile(data.isOwnProfile);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, getAccessToken]);

  const sendFriendRequest = async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: id }),
      });
      if (res.ok) {
        setFriendshipStatus("PENDING");
      }
    } catch (err) {
      console.error("Failed to send friend request:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-text-secondary">User not found.</p>
      </div>
    );
  }

  if (isOwnProfile) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-text-secondary">
          This is your profile.{" "}
          <Link href="/profile" className="text-blurple hover:text-blurple-light">
            Go to your profile page
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-3xl font-bold text-blurple-light">
              {profile.displayName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {profile.displayName ?? "Unknown User"}
              </h1>
              {profile.bio && (
                <p className="mt-2 max-w-lg text-text-secondary">
                  {profile.bio}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-sm text-text-muted">
                {profile.discordUsername && (
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-4 w-4" />
                    {profile.discordUsername}
                  </span>
                )}
                {profile.twitterUsername && (
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="h-4 w-4" />@
                    {profile.twitterUsername}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
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
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 border-t border-border pt-6">
          {friendshipStatus === null && (
            <button
              onClick={sendFriendRequest}
              className="flex items-center gap-2 rounded-lg bg-blurple px-5 py-2.5 text-sm font-medium text-white hover:bg-blurple-hover"
            >
              <UserPlus className="h-4 w-4" />
              Add Friend
            </button>
          )}
          {friendshipStatus === "PENDING" && (
            <button
              disabled
              className="flex items-center gap-2 rounded-lg bg-surface px-5 py-2.5 text-sm font-medium text-text-muted"
            >
              <Clock className="h-4 w-4" />
              Request Pending
            </button>
          )}
          {friendshipStatus === "ACCEPTED" && (
            <>
              <span className="flex items-center gap-2 rounded-lg bg-green/10 px-5 py-2.5 text-sm font-medium text-green">
                <UserCheck className="h-4 w-4" />
                Friends
              </span>
              <Link
                href={`/messages/${id}`}
                className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Link>
            </>
          )}
          {friendshipStatus === "BLOCKED" && (
            <span className="flex items-center gap-2 rounded-lg bg-red/10 px-5 py-2.5 text-sm font-medium text-red">
              <Ban className="h-4 w-4" />
              Blocked
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
