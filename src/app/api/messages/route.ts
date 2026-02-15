import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  sendMessage,
  getConversation,
  getInbox,
  markMessagesRead,
} from "@/lib/messages";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const partnerId = searchParams.get("partnerId");

    if (partnerId) {
      // Get conversation with specific user
      const before = searchParams.get("before") ?? undefined;
      const messages = await getConversation(user.id, partnerId, 50, before);
      // Mark messages as read
      await markMessagesRead(user.id, partnerId);
      return NextResponse.json({ messages });
    }

    // Get inbox (all conversations)
    const conversations = await getInbox(user.id);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
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

    const { receiverId, content } = await request.json();
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "receiverId and content required" },
        { status: 400 }
      );
    }

    const message = await sendMessage(user.id, receiverId, content);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
