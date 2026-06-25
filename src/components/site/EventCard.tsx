export type EventCardData = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  locationName: string | null;
  eventType: string | null;
  isSpecialEvent: boolean;
  specialEventDetails: string | null;
  notice: string | null;
  status: "scheduled" | "canceled" | "completed";
  guests: { id: string; name: string; roleOrBio: string | null }[];
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function EventCard({ event }: { event: EventCardData }) {
  return (
    <article className="border border-black p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
            {dateFormatter.format(event.startAt)}
            {event.eventType ? ` · ${event.eventType}` : ""}
          </p>
          <h3 className="mt-1 text-xl font-bold uppercase tracking-tight">
            {event.title}
          </h3>
        </div>
        {event.status !== "scheduled" && (
          <span className="shrink-0 border border-black px-2 py-1 text-xs font-bold uppercase tracking-wide">
            {event.status}
          </span>
        )}
      </div>

      {event.locationName && (
        <p className="mt-2 text-sm text-neutral-600">{event.locationName}</p>
      )}

      {event.description && (
        <p className="mt-3 text-neutral-700">{event.description}</p>
      )}

      {event.isSpecialEvent && event.specialEventDetails && (
        <p className="mt-3 text-sm font-medium">
          ★ {event.specialEventDetails}
        </p>
      )}

      {event.guests.length > 0 && (
        <p className="mt-3 text-sm text-neutral-700">
          Special guest{event.guests.length > 1 ? "s" : ""}:{" "}
          {event.guests
            .map((g) => (g.roleOrBio ? `${g.name} (${g.roleOrBio})` : g.name))
            .join(", ")}
        </p>
      )}

      {event.notice && (
        <p className="mt-4 border border-black bg-black p-2 text-sm font-medium text-white">
          {event.notice}
        </p>
      )}
    </article>
  );
}
