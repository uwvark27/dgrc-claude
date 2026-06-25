"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { requireClubMember } from "@/lib/require-club-member";

export async function uploadPhoto(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await requireClubMember();
  if (!session?.user) {
    return {
      error: "Only linked club members can upload photos.",
    };
  }

  const file = formData.get("photo") as File | null;
  const caption = (formData.get("caption") as string) || null;
  const eventId = (formData.get("eventId") as string) || null;

  if (!file || file.size === 0) {
    return { error: "Choose a photo to upload." };
  }

  const blob = await put(`photos/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  await db.insert(photos).values({
    blobUrl: blob.url,
    caption,
    eventId: eventId || null,
    uploadedBy: session.user.id,
    approved: false,
  });

  revalidatePath("/photos");
  revalidatePath("/admin/photos");

  return { success: true };
}
