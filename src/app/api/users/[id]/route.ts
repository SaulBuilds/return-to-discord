import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id },
      include: {
        guilds: { include: { guild: true } },
        _count: {
          select: {
            sentFriendships: { where: { status: "ACCEPTED" } },
            receivedFriendships: { where: { status: "ACCEPTED" } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check friendship status
    const friendship = await db.friendship.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: id },
          { senderId: id, receiverId: currentUser.id },
        ],
      },
    });

    const isOwnProfile = currentUser.id === id;

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        discordUsername: user.discordUsername,
        twitterUsername: user.twitterUsername,
        githubUsername: user.githubUsername,
        lastSyncedAt: user.lastSyncedAt,
        createdAt: user.createdAt,
        guildCount: user.guilds.length,
        friendCount:
          user._count.sentFriendships + user._count.receivedFriendships,
        guilds: isOwnProfile
          ? user.guilds.map((ug) => ({
              id: ug.guild.id,
              name: ug.guild.name,
              icon: ug.guild.icon,
            }))
          : undefined,
      },
      isOwnProfile,
      friendshipStatus: friendship?.status ?? null,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
