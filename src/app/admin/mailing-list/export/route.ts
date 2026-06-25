import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  await requireAdmin();

  const allSubscribers = await db.select().from(subscribers);

  const rows = [
    ["email", "name", "subscribed_at", "unsubscribed_at"],
    ...allSubscribers.map((s) => [
      s.email,
      s.name ?? "",
      s.subscribedAt.toISOString(),
      s.unsubscribedAt?.toISOString() ?? "",
    ]),
  ];
  const csv = rows.map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=mailing-list.csv",
    },
  });
}
