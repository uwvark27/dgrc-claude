"use server";

import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { perks } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

async function uploadPhotoIfPresent(formData: FormData) {
  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return undefined;

  const blob = await put(`perks/${Date.now()}-${file.name}`, file, {
    access: "public",
  });
  return blob.url;
}

export async function createPerk(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const partnerName = (formData.get("partnerName") as string) || null;
  const season = (formData.get("season") as string) || null;
  if (!title || !description) return;

  const photoBlobUrl = await uploadPhotoIfPresent(formData);

  await db.insert(perks).values({
    title,
    description,
    partnerName,
    season,
    photoBlobUrl,
  });

  revalidatePath("/admin/perks");
  revalidatePath("/members");
}

export async function updatePerk(id: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const partnerName = (formData.get("partnerName") as string) || null;
  const season = (formData.get("season") as string) || null;
  const isActive = formData.get("isActive") === "on";
  if (!title || !description) return;

  const photoBlobUrl = await uploadPhotoIfPresent(formData);

  await db
    .update(perks)
    .set({
      title,
      description,
      partnerName,
      season,
      isActive,
      ...(photoBlobUrl ? { photoBlobUrl } : {}),
    })
    .where(eq(perks.id, id));

  revalidatePath("/admin/perks");
  revalidatePath("/members");
  redirect("/admin/perks");
}

export async function deletePerk(id: string) {
  await requireAdmin();
  await db.delete(perks).where(eq(perks.id, id));
  revalidatePath("/admin/perks");
  revalidatePath("/members");
}
