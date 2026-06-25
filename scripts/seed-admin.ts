import { config } from "dotenv";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.error(
      "Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret npm run seed:admin",
    );
    process.exit(1);
  }

  const { db } = await import("../src/db");
  const { users } = await import("../src/db/schema");

  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, role: "admin", name })
      .where(eq(users.id, existing.id));
    console.log(`Updated existing user ${normalizedEmail} to admin.`);
  } else {
    await db.insert(users).values({
      name,
      email: normalizedEmail,
      passwordHash,
      role: "admin",
    });
    console.log(`Created admin user ${normalizedEmail}.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
