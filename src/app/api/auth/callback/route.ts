import { NextRequest, NextResponse } from "next/server";
import { privy } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const verified = await privy.verifyAuthToken(token);
    const privyUser = await privy.getUser(verified.userId);

    // Extract linked accounts
    const discordAccount = privyUser.linkedAccounts.find(
      (a) => a.type === "discord_oauth"
    );
    const twitterAccount = privyUser.linkedAccounts.find(
      (a) => a.type === "twitter_oauth"
    );
    const githubAccount = privyUser.linkedAccounts.find(
      (a) => a.type === "github_oauth"
    );

    // Upsert user
    const user = await db.user.upsert({
      where: { privyId: verified.userId },
      update: {
        discordId: discordAccount?.subject ?? undefined,
        discordUsername:
          "username" in (discordAccount ?? {})
            ? (discordAccount as { username?: string }).username
            : undefined,
        twitterId: twitterAccount?.subject ?? undefined,
        twitterUsername:
          "username" in (twitterAccount ?? {})
            ? (twitterAccount as { username?: string }).username
            : undefined,
        githubId: githubAccount?.subject ?? undefined,
        githubUsername:
          "username" in (githubAccount ?? {})
            ? (githubAccount as { username?: string }).username
            : undefined,
      },
      create: {
        privyId: verified.userId,
        displayName:
          "username" in (discordAccount ?? {})
            ? (discordAccount as { username?: string }).username
            : privyUser.email?.address?.split("@")[0] ?? "User",
        discordId: discordAccount?.subject ?? null,
        discordUsername:
          "username" in (discordAccount ?? {})
            ? (discordAccount as { username?: string }).username
            : null,
        twitterId: twitterAccount?.subject ?? null,
        twitterUsername:
          "username" in (twitterAccount ?? {})
            ? (twitterAccount as { username?: string }).username
            : null,
        githubId: githubAccount?.subject ?? null,
        githubUsername:
          "username" in (githubAccount ?? {})
            ? (githubAccount as { username?: string }).username
            : null,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
