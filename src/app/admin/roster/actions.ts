"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clubMembers, users } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function createClubMember(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const notes = (formData.get("notes") as string) || null;
  if (!name || !email) return;

  await db.insert(clubMembers).values({
    name,
    email: email.toLowerCase(),
    notes,
  });

  revalidatePath("/admin/roster");
}

export async function updateClubMember(id: string, formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const notes = (formData.get("notes") as string) || null;
  const isActive = formData.get("isActive") === "on";
  if (!name || !email) return;

  await db
    .update(clubMembers)
    .set({ name, email: email.toLowerCase(), notes, isActive })
    .where(eq(clubMembers.id, id));

  revalidatePath("/admin/roster");
}

export async function deleteClubMember(id: string) {
  await requireAdmin();
  await db.delete(clubMembers).where(eq(clubMembers.id, id));
  revalidatePath("/admin/roster");
}

export async function linkClubMember(id: string, formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  if (!userId) return;

  await db
    .update(clubMembers)
    .set({ userId, linkedAt: new Date() })
    .where(eq(clubMembers.id, id));

  revalidatePath("/admin/roster");
}

export async function unlinkClubMember(id: string) {
  await requireAdmin();
  await db
    .update(clubMembers)
    .set({ userId: null, linkedAt: null })
    .where(eq(clubMembers.id, id));

  revalidatePath("/admin/roster");
}

export async function getUnlinkedUsers() {
  await requireAdmin();
  const linkedUserIds = await db
    .select({ userId: clubMembers.userId })
    .from(clubMembers);
  const linkedSet = new Set(
    linkedUserIds.map((r) => r.userId).filter((id): id is string => !!id),
  );

  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users);

  return allUsers.filter((u) => !linkedSet.has(u.id));
}
