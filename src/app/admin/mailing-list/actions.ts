"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function addSubscriber(formData: FormData) {
  await requireAdmin();
  const email = formData.get("email") as string;
  const name = (formData.get("name") as string) || null;
  if (!email) return;

  const normalizedEmail = email.toLowerCase();
  const [existing] = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(eq(subscribers.email, normalizedEmail))
    .limit(1);

  if (existing) {
    await db
      .update(subscribers)
      .set({ unsubscribedAt: null, name })
      .where(eq(subscribers.id, existing.id));
  } else {
    await db.insert(subscribers).values({
      email: normalizedEmail,
      name,
      unsubscribeToken: randomUUID(),
    });
  }

  revalidatePath("/admin/mailing-list");
}

export async function removeSubscriber(id: string) {
  await requireAdmin();
  await db
    .update(subscribers)
    .set({ unsubscribedAt: new Date() })
    .where(eq(subscribers.id, id));
  revalidatePath("/admin/mailing-list");
}

export async function deleteSubscriber(id: string) {
  await requireAdmin();
  await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/admin/mailing-list");
}
