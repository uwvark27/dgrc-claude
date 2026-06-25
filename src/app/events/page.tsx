import { getEvents } from "@/lib/events";
import { EventCard } from "@/components/site/EventCard";

export default async function EventsPage() {
  const events = await getEvents();
  const now = Date.now();
  const upcoming = events.filter((e) => e.startAt.getTime() >= now);
  const past = events.filter((e) => e.startAt.getTime() < now);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold uppercase tracking-tight">Events</h1>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Upcoming
      </h2>
      <div className="mt-4 flex flex-col gap-4">
        {upcoming.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {upcoming.length === 0 && (
          <p className="text-neutral-600">No upcoming events scheduled.</p>
        )}
      </div>

      {past.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-bold uppercase tracking-wide">
            Past
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
