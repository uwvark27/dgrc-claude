"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createEvent } from "./actions";

const EVENT_TYPES = [
  { value: "RUN", label: "Run" },
  { value: "MEMBER PARTY", label: "Member Party" },
  { value: "CHEER STATION", label: "Cheer Station" },
  { value: "MEDAL MONDAY", label: "Medal Monday" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "canceled", label: "Canceled" },
  { value: "completed", label: "Completed" },
];

function getSeason(dateStr: string): number {
  if (!dateStr) return 5;
  const d = new Date(dateStr);
  // Season 5 runs through end of May 2027
  if (d <= new Date("2027-05-31T23:59:59")) return 5;
  return 6;
}

type Location = { id: string; name: string; address: string | null };
type RunRoute = { id: string; name: string; distanceMiles: string | null };

export function EventFormSection({
  locations,
  runRoutes,
}: {
  locations: Location[];
  runRoutes: RunRoute[];
}) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(() => searchParams.get("new") === "1");
  const [season, setSeason] = useState(5);
  const formRef = useRef<HTMLFormElement>(null);

  function handleStartChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSeason(getSeason(e.target.value));
  }

  async function handleSubmit(formData: FormData) {
    await createEvent(formData);
    formRef.current?.reset();
    setSeason(5);
    setOpen(false);
  }

  return (
    <div className="mt-8 border border-black">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-neutral-50"
      >
        <span>Add New Event</span>
        <span className="text-lg leading-none">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <form
          ref={formRef}
          action={handleSubmit}
          className="border-t border-black p-4 flex flex-col gap-3"
        >
          {/* Row 1: Season + Type + Status */}
          <div className="flex gap-3">
            <label className="flex w-24 flex-col gap-1 text-sm font-medium">
              Season
              <input
                name="seasonNumber"
                type="number"
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                className="border border-black px-3 py-2"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
              Event Type
              <select name="eventType" defaultValue="RUN" className="border border-black px-3 py-2">
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
              Status
              <select name="status" defaultValue="scheduled" className="border border-black px-3 py-2">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
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
                onChange={handleStartChange}
                className="border border-black px-3 py-2"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
              Ends
              <input
                type="datetime-local"
                name="endAt"
                className="border border-black px-3 py-2"
              />
            </label>
          </div>

          {/* Row 3: Location */}
          <div className="flex items-end gap-2">
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
              Location
              <select name="locationId" className="border border-black px-3 py-2">
                <option value="">— None —</option>
                {locations.map((l) => (
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
          {runRoutes.length > 0 && (
            <fieldset className="border border-neutral-300 px-3 py-2">
              <legend className="text-sm font-medium px-1">Run Routes</legend>
              <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
                {runRoutes.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="runRouteIds" value={r.id} />
                    {r.name}{r.distanceMiles ? ` (${r.distanceMiles} mi)` : ""}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Row 5: Title */}
          <label className="flex flex-col gap-1 text-sm font-medium">
            Title
            <input name="title" required className="border border-black px-3 py-2" />
          </label>

          {/* Row 6: Description */}
          <label className="flex flex-col gap-1 text-sm font-medium">
            Description
            <textarea
              name="description"
              rows={5}
              className="border border-black px-3 py-2"
            />
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
            >
              Add Event
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border border-black px-6 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
