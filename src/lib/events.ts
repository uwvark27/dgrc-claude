import { gte } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import type { EventCardData } from "@/components/site/EventCard";

export async function getEvents({
  upcomingOnly = false,
  limit,
}: {
  upcomingOnly?: boolean;
  limit?: number;
} = {}): Promise<EventCardData[]> {
  const rows = await db.query.events.findMany({
    where: upcomingOnly ? gte(events.startAt, new Date()) : undefined,
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
    isSpecialEvent: row.isSpecialEvent,
    specialEventDetails: row.specialEventDetails,
    notice: row.notice,
    status: row.status,
    guests: row.guests.map((g) => ({
      id: g.id,
      name: g.name,
      roleOrBio: g.roleOrBio,
    })),
  }));
}
