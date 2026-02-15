import { db } from "./db";

export interface MatchedUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  discordUsername: string | null;
  twitterUsername: string | null;
  score: number;
  sharedGuilds: { id: string; name: string; icon: string | null }[];
  twitterRelation: "mutual" | "following" | "follower" | "none";
}

const POINTS = {
  SHARED_GUILD: 10,
  MAX_GUILD_POINTS: 50,
  TWITTER_MUTUAL: 40,
  TWITTER_FOLLOWING: 15,
  TWITTER_FOLLOWER: 10,
  MAX_SCORE: 100,
} as const;

export function computeScore(
  sharedGuildCount: number,
  twitterRelation: "mutual" | "following" | "follower" | "none"
): number {
  const guildPoints = Math.min(
    sharedGuildCount * POINTS.SHARED_GUILD,
    POINTS.MAX_GUILD_POINTS
  );

  let twitterPoints = 0;
  switch (twitterRelation) {
    case "mutual":
      twitterPoints = POINTS.TWITTER_MUTUAL;
      break;
    case "following":
      twitterPoints = POINTS.TWITTER_FOLLOWING;
      break;
    case "follower":
      twitterPoints = POINTS.TWITTER_FOLLOWER;
      break;
  }

  return Math.min(guildPoints + twitterPoints, POINTS.MAX_SCORE);
}

export function getStrengthLevel(
  score: number
): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export async function findMatches(
  userId: string,
  options?: {
    minScore?: number;
    guildId?: string;
    twitterRelation?: "mutual" | "following" | "follower";
    limit?: number;
    offset?: number;
  }
): Promise<{ matches: MatchedUser[]; total: number }> {
  const { minScore = 0, guildId, twitterRelation, limit = 20, offset = 0 } =
    options ?? {};

  // Get user's guild IDs
  const userGuilds = await db.userGuild.findMany({
    where: { userId },
    select: { guildId: true },
  });
  const userGuildIds = userGuilds.map((g) => g.guildId);

  // Get user's Twitter connections
  const userFollowing = await db.twitterConnection.findMany({
    where: { userId, type: "FOLLOWING" },
    select: { targetId: true },
  });
  const userFollowers = await db.twitterConnection.findMany({
    where: { userId, type: "FOLLOWER" },
    select: { targetId: true },
  });

  const followingIds = new Set(userFollowing.map((c) => c.targetId));
  const followerIds = new Set(userFollowers.map((c) => c.targetId));

  // Find users who share at least one guild or have a Twitter connection
  let candidateUserIds = new Set<string>();

  if (userGuildIds.length > 0) {
    const sharedGuildUsers = await db.userGuild.findMany({
      where: {
        guildId: guildId ? guildId : { in: userGuildIds },
        userId: { not: userId },
      },
      select: { userId: true },
    });
    sharedGuildUsers.forEach((u) => candidateUserIds.add(u.userId));
  }

  // Add Twitter-connected users
  followingIds.forEach((id) => candidateUserIds.add(id));
  followerIds.forEach((id) => candidateUserIds.add(id));

  if (candidateUserIds.size === 0) {
    return { matches: [], total: 0 };
  }

  // Fetch candidate user details
  const candidates = await db.user.findMany({
    where: { id: { in: Array.from(candidateUserIds) } },
    include: {
      guilds: {
        include: { guild: true },
        where: { guildId: { in: userGuildIds } },
      },
    },
  });

  // Score each candidate
  const scored: MatchedUser[] = candidates
    .map((candidate) => {
      const sharedGuilds = candidate.guilds.map((ug) => ({
        id: ug.guild.id,
        name: ug.guild.name,
        icon: ug.guild.icon,
      }));

      const isFollowing = followingIds.has(candidate.id);
      const isFollower = followerIds.has(candidate.id);

      let relation: "mutual" | "following" | "follower" | "none" = "none";
      if (isFollowing && isFollower) relation = "mutual";
      else if (isFollowing) relation = "following";
      else if (isFollower) relation = "follower";

      const score = computeScore(sharedGuilds.length, relation);

      return {
        id: candidate.id,
        displayName: candidate.displayName,
        avatarUrl: candidate.avatarUrl,
        discordUsername: candidate.discordUsername,
        twitterUsername: candidate.twitterUsername,
        score,
        sharedGuilds,
        twitterRelation: relation,
      };
    })
    .filter((m) => m.score >= minScore)
    .filter((m) => !twitterRelation || m.twitterRelation === twitterRelation);

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const total = scored.length;
  const matches = scored.slice(offset, offset + limit);

  return { matches, total };
}
