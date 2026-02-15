import { PrivyClient } from "@privy-io/server-auth";
import { cookies } from "next/headers";
import { db } from "./db";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("privy-token")?.value;
  return token ?? null;
}

export async function verifyAuth() {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const verified = await privy.verifyAuthToken(token);
    return verified;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const authData = await verifyAuth();
  if (!authData) return null;

  const user = await db.user.findUnique({
    where: { privyId: authData.userId },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export { privy };
