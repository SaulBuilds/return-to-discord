const DISCORD_API_BASE = "https://discord.com/api/v10";

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
}

export async function fetchUserGuilds(
  accessToken: string
): Promise<DiscordGuild[]> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Discord API error: ${response.status} ${response.statusText}`
    );
  }

  const guilds = await response.json();
  return guilds.map((g: Record<string, unknown>) => ({
    id: g.id as string,
    name: g.name as string,
    icon: g.icon as string | null,
  }));
}

export async function fetchUserProfile(accessToken: string) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Discord API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export function getDiscordAvatarUrl(
  userId: string,
  avatarHash: string | null
): string {
  if (!avatarHash) {
    const defaultIndex = Number(BigInt(userId) >> BigInt(22)) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  }
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}`;
}

export function getGuildIconUrl(
  guildId: string,
  iconHash: string | null
): string | null {
  if (!iconHash) return null;
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png`;
}
