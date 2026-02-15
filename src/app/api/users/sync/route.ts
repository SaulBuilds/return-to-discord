import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync";

export async function POST(request: NextRequest) {
  try {
    const authData = await verifyAuth();
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { privyId: authData.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Rate limit: max one sync per minute
    if (user.lastSyncedAt) {
      const sinceLastSync =
        Date.now() - new Date(user.lastSyncedAt).getTime();
      if (sinceLastSync < 60_000) {
        return NextResponse.json(
          {
            error: "Please wait before syncing again",
            retryAfter: Math.ceil((60_000 - sinceLastSync) / 1000),
          },
          { status: 429 }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const { discordAccessToken, twitterAccessToken, twitterUserId } = body;

    const result = await syncUser(
      user.id,
      discordAccessToken,
      twitterAccessToken,
      twitterUserId
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
