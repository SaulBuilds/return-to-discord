import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getSentRequests,
} from "@/lib/friendships";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tab = request.nextUrl.searchParams.get("tab") ?? "friends";

    switch (tab) {
      case "friends": {
        const friends = await getFriends(user.id);
        return NextResponse.json({ friends });
      }
      case "pending": {
        const pending = await getPendingRequests(user.id);
        return NextResponse.json({ pending });
      }
      case "sent": {
        const sent = await getSentRequests(user.id);
        return NextResponse.json({ sent });
      }
      default:
        return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
    }
  } catch (error) {
    console.error("Friends error:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await request.json();
    if (!receiverId) {
      return NextResponse.json(
        { error: "receiverId required" },
        { status: 400 }
      );
    }

    const friendship = await sendFriendRequest(user.id, receiverId);
    return NextResponse.json({ friendship }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendshipId, action } = await request.json();
    if (!friendshipId || !action) {
      return NextResponse.json(
        { error: "friendshipId and action required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "accept": {
        const friendship = await acceptFriendRequest(friendshipId, user.id);
        return NextResponse.json({ friendship });
      }
      case "decline": {
        const friendship = await declineFriendRequest(friendshipId, user.id);
        return NextResponse.json({ friendship });
      }
      case "remove": {
        await removeFriend(friendshipId, user.id);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update friendship";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
