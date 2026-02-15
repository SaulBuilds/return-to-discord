import { db } from "./db";
import { NotificationType, Prisma } from "@prisma/client";
import { pusherServer, getUserChannel } from "./pusher";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string,
  data?: Prisma.InputJsonValue
) {
  const notification = await db.notification.create({
    data: { userId, type, title, body, data: data ?? Prisma.JsonNull },
  });

  // Push real-time notification
  try {
    await pusherServer.trigger(getUserChannel(userId), "notification", {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      createdAt: notification.createdAt,
    });
  } catch {
    // Pusher failure shouldn't break notification creation
  }

  return notification;
}

export async function getNotifications(
  userId: string,
  limit = 20,
  unreadOnly = false
) {
  return db.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({
    where: { userId, read: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return db.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
