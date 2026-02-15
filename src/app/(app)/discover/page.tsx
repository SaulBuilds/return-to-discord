"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { UserCard } from "@/components/user-card";
import type { MatchedUser } from "@/lib/matching";
import { Search, SlidersHorizontal } from "lucide-react";

export default function DiscoverPage() {
  const { getAccessToken } = usePrivy();
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    minScore: 0,
    twitterRelation: "" as string,
    guildId: "" as string,
  });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  const loadMatches = useCallback(
    async (newOffset = 0) => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(newOffset),
        });
        if (filters.minScore > 0)
          params.set("minScore", String(filters.minScore));
        if (filters.twitterRelation)
          params.set("twitterRelation", filters.twitterRelation);
        if (filters.guildId) params.set("guildId", filters.guildId);

        const res = await fetch(`/api/matches?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches);
          setTotal(data.total);
          setOffset(newOffset);
        }
      } catch (err) {
        console.error("Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    },
    [getAccessToken, filters]
  );

  useEffect(() => {
    loadMatches(0);
  }, [loadMatches]);

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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Discover</h1>
          <p className="mt-1 text-text-secondary">
            Browse and filter people across your Discord servers and Twitter
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-card-hover hover:text-text-primary"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Min Strength
              </label>
              <select
                value={filters.minScore}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    minScore: parseInt(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value={0}>Any</option>
                <option value={40}>Medium (40+)</option>
                <option value={70}>Strong (70+)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Twitter Relation
              </label>
              <select
                value={filters.twitterRelation}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    twitterRelation: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value="">Any</option>
                <option value="mutual">Mutual Follow</option>
                <option value="following">You Follow</option>
                <option value="follower">Follows You</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({ minScore: 0, twitterRelation: "", guildId: "" })
                }
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-text-muted">
            Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}{" "}
            matches
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <UserCard
                key={match.id}
                user={match}
                onAddFriend={handleAddFriend}
              />
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => loadMatches(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-text-muted">
                Page {Math.floor(offset / limit) + 1} of{" "}
                {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => loadMatches(offset + limit)}
                disabled={offset + limit >= total}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-text-muted" />
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            No Matches Found
          </h3>
          <p className="text-text-secondary">
            {filters.minScore > 0 || filters.twitterRelation
              ? "Try adjusting your filters to see more results."
              : "Link your Discord and Twitter accounts to start discovering connections."}
          </p>
        </div>
      )}
    </div>
  );
}
