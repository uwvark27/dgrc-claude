import { db } from "@/db";
import { runRoutes } from "@/db/schema";
import { PageHeader } from "@/components/site/PageHeader";

function difficultyClass(difficulty: string | null) {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "border-gold-deep text-gold-deep";
    case "hard":
      return "border-rust text-rust";
    default:
      return "border-ink text-ink";
  }
}

export default async function RunRoutesPage() {
  const routes = await db.select().from(runRoutes).orderBy(runRoutes.name);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <PageHeader
        eyebrow="Where we run"
        title="Run Routes"
        lede="Routes the club uses for group runs. We reference these on RunGo — tap through for the live map."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {routes.map((route) => (
          <article
            key={route.id}
            className="flex flex-col border border-line-light bg-cream p-6 transition-colors hover:border-ink"
          >
            <div className="flex items-baseline justify-between gap-3">
              {route.distanceMiles && (
                <span className="font-display text-4xl uppercase">
                  {route.distanceMiles}{" "}
                  <span className="text-xl text-gold-deep">mi</span>
                </span>
              )}
              {route.difficulty && (
                <span
                  className={`border-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${difficultyClass(route.difficulty)}`}
                >
                  {route.difficulty}
                </span>
              )}
            </div>

            <h2 className="mt-3 font-display text-2xl uppercase leading-tight">
              {route.name}
            </h2>

            {route.startAddress && (
              <p className="mt-1 text-sm font-medium text-stone-warm">
                Starts: {route.startAddress}
              </p>
            )}

            {route.description && (
              <p className="mt-3 text-ink/80">{route.description}</p>
            )}

            {(route.runGoUrl || route.gpxBlobUrl) && (
              <div className="mt-auto flex flex-wrap gap-3 pt-5">
                {route.runGoUrl && (
                  <a
                    href={route.runGoUrl}
                    className="btn btn-outline !px-4 !py-2 !text-xs"
                  >
                    View on RunGo
                  </a>
                )}
                {route.gpxBlobUrl && (
                  <a
                    href={route.gpxBlobUrl}
                    className="btn btn-outline !px-4 !py-2 !text-xs"
                  >
                    Download GPX
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
        {routes.length === 0 && (
          <p className="text-stone-warm">No routes added yet.</p>
        )}
      </div>
    </div>
  );
}
