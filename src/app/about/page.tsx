export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold uppercase tracking-tight">
        About DGRC
      </h1>
      <p className="mt-6 text-lg text-neutral-700">
        The Dancing Gnome Run Club is a group run community built around
        Dancing Gnome Beer — runners first, beer after. We meet up for group
        runs, races, and the occasional post-run pint.
      </p>
      <p className="mt-4 text-neutral-700">
        Whether you&apos;re training for a race or just looking for people to
        run with, DGRC welcomes runners of every pace. Check the{" "}
        <a href="/events" className="underline">
          events calendar
        </a>{" "}
        for upcoming runs, or browse our{" "}
        <a href="/run-routes" className="underline">
          go-to routes
        </a>
        .
      </p>
    </div>
  );
}
