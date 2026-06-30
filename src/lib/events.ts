import { gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import type { EventCardData } from "@/components/site/EventCard";

export async function getEvents({
  upcomingOnly = false,
  pastOnly = false,
  limit,
}: {
  upcomingOnly?: boolean;
  pastOnly?: boolean;
  limit?: number;
} = {}): Promise<EventCardData[]> {
  const now = new Date();
  const rows = await db.query.events.findMany({
    where: upcomingOnly
      ? gte(events.startAt, now)
      : pastOnly
        ? lt(events.startAt, now)
        : undefined,
    orderBy: (e, { asc, desc }) =>
      upcomingOnly ? [asc(e.startAt)] : [desc(e.startAt)],
    limit,
    with: {
      location: true,
      guests: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    startAt: row.startAt,
    endAt: row.endAt,
    locationName: row.location?.name ?? null,
    eventType: row.eventType,
    status: row.status,
    guests: row.guests.map((g) => ({
      id: g.id,
      name: g.name,
      roleOrBio: g.roleOrBio,
    })),
  }));
}
