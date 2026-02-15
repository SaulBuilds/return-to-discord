import { db } from "./db";
import { FriendshipStatus } from "@prisma/client";

export async function sendFriendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) {
    throw new Error("Cannot send friend request to yourself");
  }

  // Check if friendship already exists
  const existing = await db.friendship.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "BLOCKED") {
      throw new Error("Cannot send friend request");
    }
    if (existing.status === "ACCEPTED") {
      throw new Error("Already friends");
    }
    if (existing.status === "PENDING") {
      // If the other person already sent a request, auto-accept
      if (existing.senderId === receiverId) {
        return db.friendship.update({
          where: { id: existing.id },
          data: { status: "ACCEPTED" },
        });
      }
      throw new Error("Friend request already sent");
    }
    if (existing.status === "DECLINED") {
      // Allow re-sending after decline
      return db.friendship.update({
        where: { id: existing.id },
        data: { senderId, receiverId, status: "PENDING" },
      });
    }
  }

  return db.friendship.create({
    data: { senderId, receiverId, status: "PENDING" },
  });
}

export async function acceptFriendRequest(
  friendshipId: string,
  userId: string
) {
  const friendship = await db.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship || friendship.receiverId !== userId) {
    throw new Error("Friend request not found");
  }
  if (friendship.status !== "PENDING") {
    throw new Error("Friend request is not pending");
  }

  return db.friendship.update({
    where: { id: friendshipId },
    data: { status: "ACCEPTED" },
  });
}

export async function declineFriendRequest(
  friendshipId: string,
  userId: string
) {
  const friendship = await db.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship || friendship.receiverId !== userId) {
    throw new Error("Friend request not found");
  }

  return db.friendship.update({
    where: { id: friendshipId },
    data: { status: "DECLINED" },
  });
}

export async function removeFriend(friendshipId: string, userId: string) {
  const friendship = await db.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (
    !friendship ||
    (friendship.senderId !== userId && friendship.receiverId !== userId)
  ) {
    throw new Error("Friendship not found");
  }

  return db.friendship.delete({ where: { id: friendshipId } });
}

export async function blockUser(blockerId: string, blockedId: string) {
  // Remove any existing friendship
  await db.friendship.deleteMany({
    where: {
      OR: [
        { senderId: blockerId, receiverId: blockedId },
        { senderId: blockedId, receiverId: blockerId },
      ],
    },
  });

  return db.friendship.create({
    data: { senderId: blockerId, receiverId: blockedId, status: "BLOCKED" },
  });
}

export async function getFriends(userId: string) {
  const friendships = await db.friendship.findMany({
    where: {
      OR: [
        { senderId: userId, status: "ACCEPTED" },
        { receiverId: userId, status: "ACCEPTED" },
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          discordUsername: true,
          twitterUsername: true,
        },
      },
      receiver: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          discordUsername: true,
          twitterUsername: true,
        },
      },
    },
  });

  return friendships.map((f) => ({
    friendshipId: f.id,
    friend: f.senderId === userId ? f.receiver : f.sender,
  }));
}

export async function getPendingRequests(userId: string) {
  return db.friendship.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: {
      sender: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          discordUsername: true,
          twitterUsername: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSentRequests(userId: string) {
  return db.friendship.findMany({
    where: { senderId: userId, status: "PENDING" },
    include: {
      receiver: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          discordUsername: true,
          twitterUsername: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
