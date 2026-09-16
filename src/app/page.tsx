import { Suspense } from "react";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { getEvents } from "@/lib/events";
import { EventCard } from "@/components/site/EventCard";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { WeatherWidget } from "@/components/site/WeatherWidget";

// Self-corrects which events count as "upcoming" over time, not just when
// an admin edit triggers revalidatePath.
export const revalidate = 300;

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const firstRunSteps = [
  {
    step: "01",
    title: "Show up",
    body: "Thursday, 6:30 PM at the taproom — 925 Main St, Sharpsburg. No signup, no fee, no minimum pace. Just be there a few minutes early.",
  },
  {
    step: "02",
    title: "Run",
    body: "A social 5K through Sharpsburg. Run it, jog it, walk it — we're zero drop, so nobody gets left behind. Dogs and strollers welcome.",
  },
  {
    step: "03",
    title: "Hang",
    body: "The run is half the point. Stick around on the patio after — that's where the club actually happens, one pour at a time.",
  },
];

const weeklySchedule = [
  {
    day: "Thu",
    time: "6:30 PM",
    name: "Run Club",
    where: "Dancing Gnome — 925 Main",
    cadence: "Every week",
  },
  {
    day: "Sat",
    time: "9:00 AM",
    name: "Long Run",
    where: "Riverfront 47 Trailhead",
    cadence: "Most weekends",
  },
];

export default async function Home() {
  const [upcomingEvents, wallPhotos, session] = await Promise.all([
    getEvents({ upcomingOnly: true, limit: 3 }),
    db.query.photos.findMany({
      where: eq(photos.approved, true),
      orderBy: (p, { desc }) => [desc(p.uploadedAt)],
      limit: 8,
    }),
    auth(),
  ]);
  const isAdmin = session?.user?.role === "admin";
  const nextRun = upcomingEvents[0];

  return (
    <div>
      <section className="relative isolate -mt-20 flex min-h-svh items-end overflow-hidden bg-ink text-paper">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          src="/dgrc-video.mp4"
          poster="/dgrc-video-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-14 pt-32">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow text-gold">
                Dancing Gnome Run Club · Sharpsburg, PA
              </p>
              <h1 className="mt-4 font-display text-display-xl uppercase">
                Social miles
                <br />
                <span className="text-gold">Social beers</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-paper/85">
                Pittsburgh&apos;s finest brewery run club. All paces and all
                people welcome.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="#first-run" className="btn btn-primary">
                  Join us
                </Link>
                <Link href="/events" className="btn btn-outline">
                  See all events
                </Link>
              </div>
            </div>

            <aside className="w-full max-w-sm shrink-0 border-l-4 border-gold bg-ink/75 p-6 backdrop-blur-sm">
              <p className="eyebrow text-gold">Next run</p>
              {nextRun ? (
                <>
                  <p className="mt-3 font-display text-3xl uppercase">
                    {weekdayFormatter.format(nextRun.startAt)} ·{" "}
                    {timeFormatter.format(nextRun.startAt)}
                  </p>
                  <p className="mt-2 text-paper/85">
                    {dateFormatter.format(nextRun.startAt)}
                    {nextRun.locationName ? ` — ${nextRun.locationName}` : ""}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 font-display text-3xl uppercase">
                    Thursdays · 6:30 PM
                  </p>
                  <p className="mt-2 text-paper/85">
                    Dancing Gnome — 925 Main St, Sharpsburg
                  </p>
                </>
              )}
              <p className="mt-1 text-paper/85">
                All paces welcome · zero drop
              </p>
              <p className="mt-4 font-semibold uppercase tracking-wide text-gold">
                Free — just show up
              </p>
            </aside>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <WeatherWidget />
      </Suspense>

      <section id="first-run" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6 py-section">
          <p className="eyebrow">New here?</p>
          <h2 className="mt-2 font-display text-display-md uppercase">
            Your first run
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {firstRunSteps.map((item) => (
              <div key={item.step} className="border-t-4 border-gold pt-5">
                <p className="font-display text-5xl text-gold">{item.step}</p>
                <h3 className="mt-3 font-display text-2xl uppercase">
                  {item.title}
                </h3>
                <p className="mt-3 text-ink/80">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-section">
          <p className="eyebrow text-gold">Rain or shine</p>
          <h2 className="mt-2 font-display text-display-md uppercase">
            The weekly schedule
          </h2>
          <div className="mt-10">
            {weeklySchedule.map((row) => (
              <div
                key={`${row.day}-${row.name}`}
                className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-line py-6 last:border-b"
              >
                <span className="w-20 font-display text-4xl uppercase text-gold">
                  {row.day}
                </span>
                <span className="font-display text-2xl uppercase">
                  {row.time}
                </span>
                <span className="font-display text-2xl uppercase">
                  {row.name}
                </span>
                <span className="text-paper/70">{row.where}</span>
                <span className="ml-auto text-sm font-semibold uppercase tracking-[0.14em] text-gold">
                  {row.cadence}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-smoke">
            Parties, guest runs, and one-offs land on the events page.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-section">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">On the calendar</p>
            <h2 className="mt-2 font-display text-display-md uppercase">
              Upcoming events
            </h2>
          </div>
          {isAdmin && (
            <Link
              href="/admin/events?new=1"
              className="btn btn-outline shrink-0 !px-4 !py-2 text-xs"
            >
              + Add Event
            </Link>
          )}
        </div>
        <div className="mt-8 flex flex-col gap-4">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-stone-warm">No upcoming events scheduled.</p>
          )}
        </div>
      </section>

      {wallPhotos.length > 0 && (
        <section className="border-t border-line-light">
          <div className="mx-auto max-w-6xl px-6 py-section">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Community</p>
                <h2 className="mt-2 font-display text-display-md uppercase">
                  The photo wall
                </h2>
              </div>
              <Link
                href="/photos"
                className="btn btn-outline shrink-0 !px-4 !py-2 text-xs"
              >
                See all photos
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {wallPhotos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.blobUrl}
                  alt={photo.caption ?? ""}
                  className="aspect-square w-full border border-line-light object-cover transition-opacity hover:opacity-85"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="join" className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-section">
          <p className="eyebrow text-gold">Join us</p>
          <h2 className="mt-2 font-display text-display-md uppercase">
            Stay in the loop
          </h2>
          <p className="mt-4 max-w-xl text-paper/85">
            Run schedules, event announcements, and club news. No spam — just
            the good stuff.
          </p>
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}
