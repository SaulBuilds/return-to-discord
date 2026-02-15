import { db } from "./db";
import { fetchUserGuilds, type DiscordGuild } from "./discord";
import {
  fetchFollowing,
  fetchFollowers,
  type TwitterUser,
} from "./twitter";

interface SyncResult {
  guildssynced: number;
  twitterConnectionsSynced: number;
}

export async function syncDiscordGuilds(
  userId: string,
  discordAccessToken: string
): Promise<number> {
  const guilds = await fetchUserGuilds(discordAccessToken);

  // Upsert guilds and user-guild relationships
  for (const guild of guilds) {
    await db.discordGuild.upsert({
      where: { id: guild.id },
      update: { name: guild.name, icon: guild.icon },
      create: { id: guild.id, name: guild.name, icon: guild.icon },
    });

    await db.userGuild.upsert({
      where: { userId_guildId: { userId, guildId: guild.id } },
      update: {},
      create: { userId, guildId: guild.id },
    });
  }

  // Remove guilds user is no longer in
  const currentGuildIds = guilds.map((g) => g.id);
  await db.userGuild.deleteMany({
    where: {
      userId,
      guildId: { notIn: currentGuildIds },
    },
  });

  return guilds.length;
}

export async function syncTwitterConnections(
  userId: string,
  twitterUserId: string,
  twitterAccessToken: string
): Promise<number> {
  const [following, followers] = await Promise.all([
    fetchFollowing(twitterUserId, twitterAccessToken),
    fetchFollowers(twitterUserId, twitterAccessToken),
  ]);

  let synced = 0;

  // Find platform users who have these twitter IDs
  const followingIds = following.map((u) => u.id);
  const followerIds = followers.map((u) => u.id);
  const allTwitterIds = [...new Set([...followingIds, ...followerIds])];

  const platformUsers = await db.user.findMany({
    where: { twitterId: { in: allTwitterIds } },
    select: { id: true, twitterId: true },
  });

  const twitterToUserId = new Map(
    platformUsers.map((u) => [u.twitterId, u.id])
  );

  // Delete old connections for this user
  await db.twitterConnection.deleteMany({
    where: { userId },
  });

  // Create following connections
  const followingConnections = following
    .filter((u) => twitterToUserId.has(u.id))
    .map((u) => ({
      userId,
      targetId: twitterToUserId.get(u.id)!,
      type: "FOLLOWING" as const,
    }));

  // Create follower connections
  const followerConnections = followers
    .filter((u) => twitterToUserId.has(u.id))
    .map((u) => ({
      userId,
      targetId: twitterToUserId.get(u.id)!,
      type: "FOLLOWER" as const,
    }));

  const allConnections = [...followingConnections, ...followerConnections];

  if (allConnections.length > 0) {
    await db.twitterConnection.createMany({
      data: allConnections,
      skipDuplicates: true,
    });
    synced = allConnections.length;
  }

  return synced;
}

export async function syncUser(
  userId: string,
  discordAccessToken?: string,
  twitterAccessToken?: string,
  twitterUserId?: string
): Promise<SyncResult> {
  let guildssynced = 0;
  let twitterConnectionsSynced = 0;

  if (discordAccessToken) {
    guildssynced = await syncDiscordGuilds(userId, discordAccessToken);
  }

  if (twitterAccessToken && twitterUserId) {
    twitterConnectionsSynced = await syncTwitterConnections(
      userId,
      twitterUserId,
      twitterAccessToken
    );
  }

  // Update last synced timestamp
  await db.user.update({
    where: { id: userId },
    data: { lastSyncedAt: new Date() },
  });

  return { guildssynced, twitterConnectionsSynced };
}
