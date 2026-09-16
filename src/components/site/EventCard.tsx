import Link from "next/link";

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

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type CardState = "upcoming" | "past" | "canceled";

function getCardState(event: EventCardData): CardState {
  if (event.status === "canceled") return "canceled";
  if (event.startAt < new Date()) return "past";
  return "upcoming";
}

const stateStyles: Record<
  CardState,
  { article: string; meta: string; title: string; body: string; badge: string }
> = {
  upcoming: {
    article: "border border-green-700 bg-green-50 group-hover:bg-green-100",
    meta: "text-green-700",
    title: "text-black",
    body: "text-neutral-700",
    badge: "border-green-700 text-green-700",
  },
  past: {
    article: "border border-neutral-300 bg-neutral-50 group-hover:bg-neutral-100",
    meta: "text-neutral-400",
    title: "text-neutral-500",
    body: "text-neutral-400",
    badge: "border-neutral-400 text-neutral-400",
  },
  canceled: {
    article: "border border-red-600 bg-red-50 group-hover:bg-red-100",
    meta: "text-red-500",
    title: "text-black",
    body: "text-red-800",
    badge: "border-red-600 text-red-600",
  },
};

export function EventCard({ event }: { event: EventCardData }) {
  const state = getCardState(event);
  const s = stateStyles[state];

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <article className={`p-5 ${s.article}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${s.meta}`}>
              {dateFormatter.format(event.startAt)}
              {event.eventType ? ` · ${event.eventType}` : ""}
            </p>
            <h3 className={`mt-1 text-xl font-bold uppercase tracking-tight ${s.title}`}>
              {event.title}
            </h3>
          </div>
          {event.status !== "scheduled" && (
            <span
              className={`shrink-0 border px-2 py-1 text-xs font-bold uppercase tracking-wide ${s.badge}`}
            >
              {event.status}
            </span>
          )}
        </div>

        {event.locationName && (
          <p className={`mt-2 text-sm ${s.body}`}>{event.locationName}</p>
        )}

        {event.description && (
          <p className={`mt-3 ${s.body}`}>{event.description}</p>
        )}

        {event.guests.length > 0 && (
          <p className={`mt-3 text-sm ${s.body}`}>
            Special guest{event.guests.length > 1 ? "s" : ""}:{" "}
            {event.guests
              .map((g) => (g.roleOrBio ? `${g.name} (${g.roleOrBio})` : g.name))
              .join(", ")}
          </p>
        )}
      </article>
    </Link>
  );
}
