const TWITTER_API_BASE = "https://api.twitter.com/2";

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

export async function fetchFollowing(
  userId: string,
  accessToken: string
): Promise<TwitterUser[]> {
  const users: TwitterUser[] = [];
  let paginationToken: string | undefined;

  do {
    const url = new URL(`${TWITTER_API_BASE}/users/${userId}/following`);
    url.searchParams.set("max_results", "1000");
    url.searchParams.set("user.fields", "profile_image_url");
    if (paginationToken) {
      url.searchParams.set("pagination_token", paginationToken);
    }

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(
        `Twitter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    if (data.data) {
      users.push(...data.data);
    }
    paginationToken = data.meta?.next_token;
  } while (paginationToken);

  return users;
}

export async function fetchFollowers(
  userId: string,
  accessToken: string
): Promise<TwitterUser[]> {
  const users: TwitterUser[] = [];
  let paginationToken: string | undefined;

  do {
    const url = new URL(`${TWITTER_API_BASE}/users/${userId}/followers`);
    url.searchParams.set("max_results", "1000");
    url.searchParams.set("user.fields", "profile_image_url");
    if (paginationToken) {
      url.searchParams.set("pagination_token", paginationToken);
    }

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(
        `Twitter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    if (data.data) {
      users.push(...data.data);
    }
    paginationToken = data.meta?.next_token;
  } while (paginationToken);

  return users;
}

export function computeMutuals(
  following: TwitterUser[],
  followers: TwitterUser[]
): TwitterUser[] {
  const followingIds = new Set(following.map((u) => u.id));
  return followers.filter((u) => followingIds.has(u.id));
}
