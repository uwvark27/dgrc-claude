import { getEvents } from "@/lib/events";
import { EventCard } from "@/components/site/EventCard";
import { PageHeader } from "@/components/site/PageHeader";

// Self-corrects the upcoming/past split over time, not just when an admin
// edit triggers revalidatePath.
export const revalidate = 300;

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    getEvents({ upcomingOnly: true }),
    getEvents({ pastOnly: true }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <PageHeader
        eyebrow="The calendar"
        title="Events"
        lede="Group runs, parties, and everything in between. All paces, always free."
      />

      <h2 className="mt-14 font-display text-3xl uppercase">Upcoming</h2>
      <div className="mt-6 flex flex-col gap-4">
        {upcoming.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {upcoming.length === 0 && (
          <p className="text-stone-warm">No upcoming events scheduled.</p>
        )}
      </div>

      {past.length > 0 && (
        <>
          <h2 className="mt-16 font-display text-3xl uppercase text-stone-warm">
            Past runs
          </h2>
          <div className="mt-6 flex flex-col gap-4 opacity-80">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
