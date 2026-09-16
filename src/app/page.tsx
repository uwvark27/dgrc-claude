import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getEvents } from "@/lib/events";
import { EventCard } from "@/components/site/EventCard";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { WeatherWidget } from "@/components/site/WeatherWidget";

// Self-corrects which events count as "upcoming" over time, not just when
// an admin edit triggers revalidatePath.
export const revalidate = 300;

export default async function Home() {
  const [upcomingEvents, session] = await Promise.all([
    getEvents({ upcomingOnly: true, limit: 3 }),
    auth(),
  ]);
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="flex flex-col items-start gap-8 border-b border-black pb-16 sm:flex-row sm:items-center">
        <Image
          src="/logo-alt.jpg"
          alt="Dancing Gnome Run Club"
          width={160}
          height={160}
          className="shrink-0 rounded-full"
        />
        <div>
          <h1 className="text-5xl font-bold uppercase tracking-tight">
            Dancing Gnome Run Club
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-700">
            Pull up your laces. A running club for the Dancing Gnome Beer
            community — group runs, events, and a few perks along the way.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/register"
              className="border border-black bg-black px-6 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
            >
              Create an Account
            </Link>
            <Link
              href="/events"
              className="border border-black px-6 py-3 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
            >
              See Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <WeatherWidget />
      </Suspense>

      <section className="border-b border-black py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            Upcoming Events
          </h2>
          {isAdmin && (
            <Link
              href="/admin/events?new=1"
              className="border border-black px-3 py-1 text-xs font-medium uppercase tracking-wide hover:bg-black hover:text-white"
            >
              + Add Event
            </Link>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-neutral-600">No upcoming events scheduled.</p>
          )}
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-2xl font-bold uppercase tracking-wide">
          Stay in the Loop
        </h2>
        <p className="mt-4 max-w-xl text-neutral-700">
          Join the mailing list for run schedules, event announcements, and
          club news.
        </p>
        <SubscribeForm />
      </section>
    </div>
  );
}
