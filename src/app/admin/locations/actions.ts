"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function createLocation(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const notes = formData.get("notes") as string;
  if (!name) return;

  await db.insert(locations).values({
    name,
    address: address || null,
    notes: notes || null,
  });

  revalidatePath("/admin/locations");
}

export async function updateLocation(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const notes = formData.get("notes") as string;
  if (!name) return;

  await db
    .update(locations)
    .set({ name, address: address || null, notes: notes || null })
    .where(eq(locations.id, id));

  revalidatePath("/admin/locations");
  redirect("/admin/locations");
}

export async function deleteLocation(id: string) {
  await requireAdmin();
  await db.delete(locations).where(eq(locations.id, id));
  revalidatePath("/admin/locations");
}
