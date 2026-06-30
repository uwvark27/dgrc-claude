import { Suspense } from "react";
import { db } from "@/db";
import { locations, runRoutes, events } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { EventFormSection } from "./EventFormSection";
import { EventsTable } from "./EventsTable";

export default async function AdminEventsPage() {
  const [allEvents, allLocations, allRunRoutes] = await Promise.all([
    db.query.events.findMany({
      orderBy: [desc(events.startAt)],
      with: { location: true },
    }),
    db.select().from(locations).orderBy(asc(locations.name)),
    db.select().from(runRoutes).orderBy(asc(runRoutes.name)),
  ]);

  const tableRows = allEvents.map((e) => ({
    id: e.id,
    title: e.title,
    eventType: e.eventType,
    startAt: e.startAt,
    seasonNumber: e.seasonNumber,
    locationName: e.location?.name ?? null,
    status: e.status,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">Events</h1>

      {/* Collapsible create form — useSearchParams requires Suspense */}
      <Suspense>
        <EventFormSection locations={allLocations} runRoutes={allRunRoutes} />
      </Suspense>

      <EventsTable events={tableRows} />
    </div>
  );
}
