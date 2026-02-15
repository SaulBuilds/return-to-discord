"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { UserCard } from "@/components/user-card";
import type { MatchedUser } from "@/lib/matching";
import { Compass, TrendingUp, Users } from "lucide-react";

export default function DashboardPage() {
  const { getAccessToken } = usePrivy();
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, highStrength: 0 });

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/matches?limit=6", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches);
          setStats({
            total: data.total,
            highStrength: data.matches.filter(
              (m: MatchedUser) => m.score >= 70
            ).length,
          });
        }
      } catch (err) {
        console.error("Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getAccessToken]);

  const handleAddFriend = async (userId: string) => {
    try {
      const token = await getAccessToken();
      await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });
    } catch (err) {
      console.error("Failed to add friend:", err);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-text-secondary">
          Your cross-platform friend discovery overview
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blurple/10">
              <Users className="h-5 w-5 text-blurple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats.total}
              </p>
              <p className="text-sm text-text-muted">Total Matches</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green/10">
              <TrendingUp className="h-5 w-5 text-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats.highStrength}
              </p>
              <p className="text-sm text-text-muted">Strong Connections</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10">
              <Compass className="h-5 w-5 text-yellow" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {matches.length}
              </p>
              <p className="text-sm text-text-muted">New to Discover</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Matches */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">
            Top Matches
          </h2>
          <a
            href="/discover"
            className="text-sm font-medium text-blurple hover:text-blurple-light"
          >
            View All
          </a>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl bg-card"
              />
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map((match) => (
              <UserCard
                key={match.id}
                user={match}
                onAddFriend={handleAddFriend}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Compass className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              No Matches Yet
            </h3>
            <p className="text-text-secondary">
              Link your Discord and Twitter accounts to start discovering
              friends. Head to your{" "}
              <a
                href="/profile"
                className="text-blurple hover:text-blurple-light"
              >
                profile
              </a>{" "}
              to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
