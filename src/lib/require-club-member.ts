import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { clubMembers } from "@/db/schema";
import { auth } from "@/auth";

// Checks club membership fresh against the DB rather than trusting the
// session claim, since an admin may have linked/unlinked the account after
// the session's JWT was issued.
export async function requireClubMember() {
  const session = await auth();
  if (!session?.user) return null;

  const [membership] = await db
    .select({ id: clubMembers.id })
    .from(clubMembers)
    .where(
      and(
        eq(clubMembers.userId, session.user.id),
        eq(clubMembers.isActive, true),
      ),
    )
    .limit(1);

  return membership ? session : null;
}
