import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";

export const revalidate = 300;

const dateLong = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeOnly = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await db.query.events.findFirst({
    where: (e, { eq }) => eq(e.id, id),
    with: {
      location: true,
      runRoutes: { with: { runRoute: true } },
      images: {
        orderBy: (img, { asc }) => [asc(img.sortOrder), asc(img.createdAt)],
      },
    },
  });

  if (!event) notFound();

  const mainImage =
    event.images.find((img) => img.isMain) ?? event.images[0] ?? null;
  const galleryImages = event.images.filter((img) => img.id !== mainImage?.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/events"
        className="text-sm text-neutral-500 hover:text-black"
      >
        ← All Events
      </Link>

      {/* Hero image */}
      {mainImage && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden bg-neutral-100">
          <Image
            src={mainImage.blobUrl}
            alt={mainImage.displayName ?? event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Title block */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          {event.eventType && (
            <span className="border border-black px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
              {event.eventType}
            </span>
          )}
          {event.status !== "scheduled" && (
            <span
              className={`border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                event.status === "canceled"
                  ? "border-red-600 text-red-600"
                  : "border-neutral-400 text-neutral-400"
              }`}
            >
              {event.status}
            </span>
          )}
          {event.seasonNumber != null && (
            <span className="text-xs text-neutral-400 uppercase tracking-wide">
              Season {event.seasonNumber}
            </span>
          )}
        </div>

        <h1 className="mt-2 text-4xl font-bold uppercase tracking-tight">
          {event.title}
        </h1>

        <p className="mt-2 text-neutral-600">
          {dateLong.format(event.startAt)}
          {event.endAt ? ` – ${timeOnly.format(event.endAt)}` : ""}
        </p>
      </div>

      {/* Description */}
      {event.description && (
        <p className="mt-6 leading-relaxed text-neutral-700">
          {event.description}
        </p>
      )}

      {/* Location */}
      {event.location && (
        <section className="mt-10 border-t border-black pt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Location
          </h2>
          <p className="mt-2 text-lg font-semibold">{event.location.name}</p>
          {event.location.address && (
            <>
              <p className="mt-1 text-neutral-600">{event.location.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm underline hover:no-underline"
              >
                View on Google Maps ↗
              </a>
            </>
          )}
          {event.location.notes && (
            <p className="mt-2 text-sm text-neutral-500">
              {event.location.notes}
            </p>
          )}
        </section>
      )}

      {/* Run routes */}
      {event.runRoutes.length > 0 && (
        <section className="mt-10 border-t border-black pt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Run Route{event.runRoutes.length > 1 ? "s" : ""}
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {event.runRoutes.map(({ runRoute }) => (
              <div
                key={runRoute.id}
                className="border border-neutral-200 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{runRoute.name}</p>
                  <div className="flex gap-3 text-sm text-neutral-500">
                    {runRoute.distanceMiles && (
                      <span>{runRoute.distanceMiles} mi</span>
                    )}
                    {runRoute.difficulty && <span>{runRoute.difficulty}</span>}
                  </div>
                </div>
                {runRoute.description && (
                  <p className="mt-1 text-sm text-neutral-600">
                    {runRoute.description}
                  </p>
                )}
                {runRoute.startAddress && (
                  <p className="mt-1 text-sm text-neutral-500">
                    Starts at: {runRoute.startAddress}
                  </p>
                )}
                {(runRoute.runGoUrl || runRoute.gpxBlobUrl) && (
                  <div className="mt-3 flex gap-4">
                    {runRoute.runGoUrl && (
                      <a
                        href={runRoute.runGoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-black px-3 py-1 text-xs font-medium uppercase tracking-wide hover:bg-black hover:text-white"
                      >
                        View on RunGo ↗
                      </a>
                    )}
                    {runRoute.gpxBlobUrl && (
                      <a
                        href={runRoute.gpxBlobUrl}
                        download
                        className="border border-black px-3 py-1 text-xs font-medium uppercase tracking-wide hover:bg-black hover:text-white"
                      >
                        Download GPX ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Photo gallery */}
      {galleryImages.length > 0 && (
        <section className="mt-10 border-t border-black pt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Photos
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden bg-neutral-100"
              >
                <Image
                  src={img.blobUrl}
                  alt={img.displayName ?? ""}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
