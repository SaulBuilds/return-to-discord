import { db } from "./db";
import { pusherServer, getConversationChannel } from "./pusher";

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  if (!content.trim()) {
    throw new Error("Message cannot be empty");
  }

  if (content.length > 2000) {
    throw new Error("Message too long (max 2000 characters)");
  }

  // Verify they are friends
  const friendship = await db.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (!friendship) {
    throw new Error("You must be friends to send messages");
  }

  const message = await db.message.create({
    data: { senderId, receiverId, content: content.trim() },
    include: {
      sender: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Push real-time update
  const channel = getConversationChannel(senderId, receiverId);
  await pusherServer.trigger(channel, "new-message", {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    content: message.content,
    createdAt: message.createdAt,
    sender: message.sender,
  });

  return message;
}

export async function getConversation(
  userId: string,
  otherUserId: string,
  limit = 50,
  before?: string
) {
  const where: Record<string, unknown> = {
    OR: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  };

  if (before) {
    where.createdAt = { lt: new Date(before) };
  }

  const messages = await db.message.findMany({
    where,
    include: {
      sender: {
        select: { id: true, displayName: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return messages.reverse();
}

export async function getInbox(userId: string) {
  // Get latest message from each conversation
  const sentMessages = await db.message.findMany({
    where: { senderId: userId },
    select: { receiverId: true },
    distinct: ["receiverId"],
  });

  const receivedMessages = await db.message.findMany({
    where: { receiverId: userId },
    select: { senderId: true },
    distinct: ["senderId"],
  });

  const conversationPartnerIds = [
    ...new Set([
      ...sentMessages.map((m) => m.receiverId),
      ...receivedMessages.map((m) => m.senderId),
    ]),
  ];

  const conversations = await Promise.all(
    conversationPartnerIds.map(async (partnerId) => {
      const latestMessage = await db.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      const unreadCount = await db.message.count({
        where: {
          senderId: partnerId,
          receiverId: userId,
          read: false,
        },
      });

      const partner = await db.user.findUnique({
        where: { id: partnerId },
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          discordUsername: true,
        },
      });

      return {
        partner,
        latestMessage,
        unreadCount,
      };
    })
  );

  // Sort by latest message time
  conversations.sort((a, b) => {
    const timeA = a.latestMessage?.createdAt?.getTime() ?? 0;
    const timeB = b.latestMessage?.createdAt?.getTime() ?? 0;
    return timeB - timeA;
  });

  return conversations;
}

export async function markMessagesRead(userId: string, senderId: string) {
  await db.message.updateMany({
    where: {
      senderId,
      receiverId: userId,
      read: false,
    },
    data: { read: true },
  });
}
