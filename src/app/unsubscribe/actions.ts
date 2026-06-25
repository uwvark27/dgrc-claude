"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

export async function unsubscribeByToken(token: string) {
  await db
    .update(subscribers)
    .set({ unsubscribedAt: new Date() })
    .where(eq(subscribers.unsubscribeToken, token));

  redirect(`/unsubscribe?token=${token}&done=1`);
}
