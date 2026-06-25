import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="border-b border-black pb-16">
        <h1 className="text-5xl font-bold uppercase tracking-tight">
          Dancing Gnome Running Club
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
      </section>

      <section className="border-b border-black py-16">
        <h2 className="text-2xl font-bold uppercase tracking-wide">
          Upcoming Events
        </h2>
        <p className="mt-4 text-neutral-600">Event listing coming soon.</p>
      </section>

      <section className="py-16">
        <h2 className="text-2xl font-bold uppercase tracking-wide">
          Stay in the Loop
        </h2>
        <p className="mt-4 max-w-xl text-neutral-700">
          Join the mailing list for run schedules, event announcements, and
          club news.
        </p>
        <p className="mt-4 text-neutral-600">Mailing list signup coming soon.</p>
      </section>
    </div>
  );
}
