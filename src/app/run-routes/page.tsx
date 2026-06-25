import { db } from "@/db";
import { runRoutes } from "@/db/schema";

export default async function RunRoutesPage() {
  const routes = await db.select().from(runRoutes).orderBy(runRoutes.name);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold uppercase tracking-tight">
        Run Routes
      </h1>
      <p className="mt-4 text-neutral-700">
        Routes the club uses for group runs. We reference these on RunGo —
        tap through for the live map.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {routes.map((route) => (
          <article key={route.id} className="border border-black p-5">
            <h2 className="text-xl font-bold uppercase tracking-tight">
              {route.name}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {route.distanceMiles ? `${route.distanceMiles} mi` : ""}
              {route.difficulty ? ` · ${route.difficulty}` : ""}
            </p>
            {route.startAddress && (
              <p className="mt-1 text-sm text-neutral-600">
                Starts: {route.startAddress}
              </p>
            )}
            {route.description && (
              <p className="mt-3 text-neutral-700">{route.description}</p>
            )}
            <div className="mt-4 flex gap-3">
              {route.runGoUrl && (
                <a
                  href={route.runGoUrl}
                  className="border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
                >
                  View on RunGo
                </a>
              )}
              {route.gpxBlobUrl && (
                <a
                  href={route.gpxBlobUrl}
                  className="border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
                >
                  Download GPX
                </a>
              )}
            </div>
          </article>
        ))}
        {routes.length === 0 && (
          <p className="text-neutral-600">No routes added yet.</p>
        )}
      </div>
    </div>
  );
}
