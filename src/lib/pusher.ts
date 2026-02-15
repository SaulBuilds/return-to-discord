import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );
  }
  return pusherClientInstance;
}

// Channel naming conventions
export function getUserChannel(userId: string): string {
  return `private-user-${userId}`;
}

export function getConversationChannel(
  userId1: string,
  userId2: string
): string {
  // Deterministic channel name regardless of who's sender/receiver
  const sorted = [userId1, userId2].sort();
  return `private-conversation-${sorted[0]}-${sorted[1]}`;
}
