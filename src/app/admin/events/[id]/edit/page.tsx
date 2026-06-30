import Image from "next/image";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { locations, runRoutes } from "@/db/schema";
import {
  updateEvent,
  uploadEventImage,
  setMainImage,
  deleteEventImage,
} from "../../actions";

const EVENT_TYPES = [
  { value: "RUN", label: "Run" },
  { value: "MEMBER PARTY", label: "Member Party" },
  { value: "CHEER STATION", label: "Cheer Station" },
  { value: "MEDAL MONDAY", label: "Medal Monday" },
  { value: "OTHER", label: "Other" },
];

function toDateTimeLocal(date: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [event, allLocations, allRunRoutes] = await Promise.all([
    db.query.events.findFirst({
      where: (e, { eq }) => eq(e.id, id),
      with: {
        runRoutes: { with: { runRoute: true } },
        images: { orderBy: (img, { asc }) => [asc(img.sortOrder), asc(img.createdAt)] },
      },
    }),
    db.select().from(locations).orderBy(asc(locations.name)),
    db.select().from(runRoutes).orderBy(asc(runRoutes.name)),
  ]);

  if (!event) notFound();

  const linkedRouteIds = new Set(event.runRoutes.map((r) => r.runRouteId));
  const updateEventWithId = updateEvent.bind(null, id);
  const uploadImageWithId = uploadEventImage.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold uppercase tracking-tight">Edit Event</h1>
        <a href="/admin/events" className="text-sm underline">← Back to Events</a>
      </div>

      {/* ── Main form ──────────────────────────────────────────────── */}
      <form action={updateEventWithId} className="mt-8 flex max-w-2xl flex-col gap-3">
        {/* Row 1: Season + Type + Status */}
        <div className="flex gap-3">
          <label className="flex w-24 flex-col gap-1 text-sm font-medium">
            Season
            <input
              name="seasonNumber"
              type="number"
              defaultValue={event.seasonNumber ?? ""}
              className="border border-black px-3 py-2"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Event Type
            <select
              name="eventType"
              defaultValue={event.eventType ?? "RUN"}
              className="border border-black px-3 py-2"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Status
            <select
              name="status"
              defaultValue={event.status}
              className="border border-black px-3 py-2"
            >
              <option value="scheduled">Scheduled</option>
              <option value="canceled">Canceled</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>

        {/* Row 2: Dates */}
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Starts
            <input
              type="datetime-local"
              name="startAt"
              required
              defaultValue={toDateTimeLocal(event.startAt)}
              className="border border-black px-3 py-2"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Ends
            <input
              type="datetime-local"
              name="endAt"
              defaultValue={toDateTimeLocal(event.endAt)}
              className="border border-black px-3 py-2"
            />
          </label>
        </div>

        {/* Row 3: Location */}
        <div className="flex items-end gap-2">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Location
            <select
              name="locationId"
              defaultValue={event.locationId ?? ""}
              className="border border-black px-3 py-2"
            >
              <option value="">— None —</option>
              {allLocations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}{l.address ? ` — ${l.address}` : ""}
                </option>
              ))}
            </select>
          </label>
          <a
            href="/admin/locations"
            className="shrink-0 border border-black px-3 py-2 text-xs font-medium uppercase tracking-wide hover:bg-black hover:text-white"
          >
            + Add Location
          </a>
        </div>

        {/* Row 4: Run Routes */}
        {allRunRoutes.length > 0 && (
          <fieldset className="border border-neutral-300 px-3 py-2">
            <legend className="text-sm font-medium px-1">Run Routes</legend>
            <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
              {allRunRoutes.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="runRouteIds"
                    value={r.id}
                    defaultChecked={linkedRouteIds.has(r.id)}
                  />
                  {r.name}{r.distanceMiles ? ` (${r.distanceMiles} mi)` : ""}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Row 5: Title */}
        <label className="flex flex-col gap-1 text-sm font-medium">
          Title
          <input
            name="title"
            required
            defaultValue={event.title}
            className="border border-black px-3 py-2"
          />
        </label>

        {/* Row 6: Description */}
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea
            name="description"
            rows={6}
            defaultValue={event.description ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Save Changes
        </button>
      </form>

      {/* ── Images ─────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-xl font-bold uppercase tracking-wide">Images</h2>

        {event.images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {event.images.map((img) => (
              <div key={img.id} className="w-48 border border-neutral-300">
                <div className="relative h-32 w-full bg-neutral-100">
                  <Image
                    src={img.blobUrl}
                    alt={img.displayName ?? "Event image"}
                    fill
                    className="object-cover"
                  />
                  {img.isMain && (
                    <span className="absolute left-1 top-1 bg-black px-1 text-xs text-white">
                      Main
                    </span>
                  )}
                </div>
                <div className="p-2 text-xs text-neutral-600 truncate">
                  {img.displayName ?? "—"}
                </div>
                <div className="flex gap-1 border-t border-neutral-200 p-2">
                  {!img.isMain && (
                    <form action={setMainImage.bind(null, id, img.id)} className="flex-1">
                      <button
                        type="submit"
                        className="w-full border border-black px-1 py-1 text-xs hover:bg-black hover:text-white"
                      >
                        Set Main
                      </button>
                    </form>
                  )}
                  <form action={deleteEventImage.bind(null, id, img.id)}>
                    <button
                      type="submit"
                      className="border border-black px-2 py-1 text-xs hover:bg-red-600 hover:text-white hover:border-red-600"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <form
          action={uploadImageWithId}
          className="mt-4 flex max-w-md flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-sm font-medium">
            Upload Image
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="border border-black px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Display Name (optional)
            <input
              name="displayName"
              placeholder="e.g. Post-run group photo"
              className="border border-black px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="isMain" />
            Set as main image
          </label>
          <button
            type="submit"
            className="self-start border border-black bg-black px-4 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
          >
            Upload
          </button>
        </form>
      </section>

    </div>
  );
}
