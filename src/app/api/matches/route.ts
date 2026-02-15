import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findMatches } from "@/lib/matching";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const minScore = parseInt(searchParams.get("minScore") ?? "0");
    const guildId = searchParams.get("guildId") ?? undefined;
    const twitterRelation = searchParams.get("twitterRelation") as
      | "mutual"
      | "following"
      | "follower"
      | undefined;
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const result = await findMatches(user.id, {
      minScore,
      guildId,
      twitterRelation,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Matches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
