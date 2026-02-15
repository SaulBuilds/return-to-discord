import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export const friendRequestSchema = z.object({
  receiverId: z.string().min(1),
});

export const friendActionSchema = z.object({
  friendshipId: z.string().min(1),
  action: z.enum(["accept", "decline", "remove"]),
});

export const syncRequestSchema = z.object({
  discordAccessToken: z.string().optional(),
  twitterAccessToken: z.string().optional(),
  twitterUserId: z.string().optional(),
});

export const matchesQuerySchema = z.object({
  minScore: z.coerce.number().min(0).max(100).default(0),
  guildId: z.string().optional(),
  twitterRelation: z.enum(["mutual", "following", "follower"]).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});
