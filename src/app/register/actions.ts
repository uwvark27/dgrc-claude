"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { and, eq, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { clubMembers, users } from "@/db/schema";
import { signIn } from "@/auth";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerUser(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    return { error: "An account with that email already exists." };
  }

  // Registration is only open to people already on the club's membership
  // list — an admin must have added the email in /admin/roster first.
  const [membership] = await db
    .select({ id: clubMembers.id })
    .from(clubMembers)
    .where(
      and(
        eq(sql`lower(${clubMembers.email})`, normalizedEmail),
        eq(clubMembers.isActive, true),
        isNull(clubMembers.userId),
      ),
    )
    .limit(1);

  if (!membership) {
    return {
      error:
        "We don't have that email on file as a DGRC member. Contact an admin to be added before creating an account.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email: normalizedEmail,
      passwordHash,
      role: "user",
    })
    .returning({ id: users.id });

  await db
    .update(clubMembers)
    .set({ userId: newUser.id, linkedAt: new Date() })
    .where(eq(clubMembers.id, membership.id));

  await signIn("credentials", {
    email: normalizedEmail,
    password,
    redirect: false,
  });

  redirect("/");
}
