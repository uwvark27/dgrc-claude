"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function createDiscountCode(formData: FormData) {
  await requireAdmin();
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const expiresAtRaw = formData.get("expiresAt") as string;
  if (!code || !description) return;

  await db.insert(discountCodes).values({
    code,
    description,
    expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
  });

  revalidatePath("/admin/discount-codes");
  revalidatePath("/discount-codes");
}

export async function updateDiscountCode(id: string, formData: FormData) {
  await requireAdmin();
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const expiresAtRaw = formData.get("expiresAt") as string;
  const isActive = formData.get("isActive") === "on";
  if (!code || !description) return;

  await db
    .update(discountCodes)
    .set({
      code,
      description,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      isActive,
    })
    .where(eq(discountCodes.id, id));

  revalidatePath("/admin/discount-codes");
  revalidatePath("/discount-codes");
  redirect("/admin/discount-codes");
}

export async function deleteDiscountCode(id: string) {
  await requireAdmin();
  await db.delete(discountCodes).where(eq(discountCodes.id, id));
  revalidatePath("/admin/discount-codes");
  revalidatePath("/discount-codes");
}
