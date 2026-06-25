"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

const subscribeSchema = z.object({
  email: z.string().email("Enter a valid email"),
  name: z.string().optional(),
});

export async function subscribeToMailingList(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();

  const [existing] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, email))
    .limit(1);

  if (existing) {
    if (existing.unsubscribedAt) {
      await db
        .update(subscribers)
        .set({ unsubscribedAt: null, subscribedAt: new Date() })
        .where(eq(subscribers.id, existing.id));
    }
    return { success: true };
  }

  await db.insert(subscribers).values({
    email,
    name: parsed.data.name || null,
    unsubscribeToken: randomUUID(),
  });

  return { success: true };
}
