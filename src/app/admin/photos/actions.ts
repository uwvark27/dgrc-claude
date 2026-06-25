"use server";

import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function approvePhoto(id: string) {
  await requireAdmin();
  await db.update(photos).set({ approved: true }).where(eq(photos.id, id));
  revalidatePath("/admin/photos");
  revalidatePath("/photos");
}

export async function rejectPhoto(id: string) {
  await requireAdmin();
  const [photo] = await db
    .select({ blobUrl: photos.blobUrl })
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);

  await db.delete(photos).where(eq(photos.id, id));
  if (photo) await del(photo.blobUrl);

  revalidatePath("/admin/photos");
  revalidatePath("/photos");
}
