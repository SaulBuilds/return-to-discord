import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unreadOnly =
      request.nextUrl.searchParams.get("unreadOnly") === "true";
    const countOnly = request.nextUrl.searchParams.get("countOnly") === "true";

    if (countOnly) {
      const count = await getUnreadCount(user.id);
      return NextResponse.json({ count });
    }

    const notifications = await getNotifications(user.id, 20, unreadOnly);
    const unreadCount = await getUnreadCount(user.id);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, markAll } = await request.json();

    if (markAll) {
      await markAllAsRead(user.id);
    } else if (notificationId) {
      await markAsRead(notificationId, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
