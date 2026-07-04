export type EventCardData = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  locationName: string | null;
  eventType: string | null;
  status: "scheduled" | "canceled" | "completed";
  guests: { id: string; name: string; roleOrBio: string | null }[];
};

const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function EventCard({ event }: { event: EventCardData }) {
  const canceled = event.status === "canceled";

  return (
    <article className="flex gap-5 border border-line-light bg-cream p-5 transition-colors hover:border-ink sm:gap-6 sm:p-6">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 bg-ink text-paper">
        <span className="font-display text-3xl leading-none">
          {dayFormatter.format(event.startAt)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          {monthFormatter.format(event.startAt)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
            {weekdayFormatter.format(event.startAt)} ·{" "}
            {timeFormatter.format(event.startAt)}
            {event.eventType ? ` · ${event.eventType}` : ""}
          </p>
          {canceled && (
            <span className="bg-rust px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-paper">
              Canceled
            </span>
          )}
        </div>

        <h3
          className={`mt-1.5 font-display text-2xl uppercase leading-tight ${
            canceled ? "text-stone-warm line-through" : ""
          }`}
        >
          {event.title}
        </h3>

        {event.locationName && (
          <p className="mt-1 text-sm font-medium text-stone-warm">
            {event.locationName}
          </p>
        )}

        {event.description && (
          <p className="mt-3 text-ink/80">{event.description}</p>
        )}

        {event.guests.length > 0 && (
          <p className="mt-3 text-sm text-stone-warm">
            <span className="font-semibold uppercase tracking-wide text-gold-deep">
              Special guest{event.guests.length > 1 ? "s" : ""}:
            </span>{" "}
            {event.guests
              .map((g) => (g.roleOrBio ? `${g.name} (${g.roleOrBio})` : g.name))
              .join(", ")}
          </p>
        )}
      </div>
    </article>
  );
}
