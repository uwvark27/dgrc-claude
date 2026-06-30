"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { copyEvent, deleteEvent } from "./actions";

type EventRow = {
  id: string;
  title: string;
  eventType: string | null;
  startAt: Date;
  seasonNumber: number | null;
  locationName: string | null;
  status: "scheduled" | "canceled" | "completed";
};

type SortKey = keyof Pick<EventRow, "title" | "eventType" | "startAt" | "seasonNumber" | "status">;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="ml-1 text-neutral-300">↕</span>;
  return <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

// Compute per-event rankings from the full dataset (unfiltered, sorted by date asc).
// totalCount: rank among all RUN + CHEER STATION events across all time.
// seasonCount: rank among RUN events within the same season.
function buildRankMaps(events: EventRow[]) {
  const byDate = [...events].sort((a, b) =>
    a.startAt < b.startAt ? -1 : a.startAt > b.startAt ? 1 : 0,
  );

  const totalCountMap = new Map<string, number>();
  let totalIdx = 0;
  for (const e of byDate) {
    if (e.eventType === "RUN" || e.eventType === "CHEER STATION") {
      totalCountMap.set(e.id, ++totalIdx);
    }
  }

  const seasonCountMap = new Map<string, number>();
  const seasons = [...new Set(events.map((e) => e.seasonNumber).filter((s) => s !== null))];
  for (const season of seasons) {
    let idx = 0;
    for (const e of byDate) {
      if (e.seasonNumber === season && e.eventType === "RUN") {
        seasonCountMap.set(e.id, ++idx);
      }
    }
  }

  return { totalCountMap, seasonCountMap };
}

export function EventsTable({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("startAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState({ title: "", season: "", eventType: "", status: "" });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);

  const { totalCountMap, seasonCountMap } = useMemo(() => buildRankMaps(events), [events]);

  const seasons = useMemo(() => {
    const nums = [...new Set(events.map((e) => e.seasonNumber).filter((s) => s !== null))] as number[];
    return nums.sort((a, b) => a - b);
  }, [events]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filters.title && !e.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
      if (filters.season && e.seasonNumber !== Number(filters.season)) return false;
      if (filters.eventType && e.eventType !== filters.eventType) return false;
      if (filters.status && e.status !== filters.status) return false;
      return true;
    });
  }, [events, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const hasFilter = filters.title || filters.season || filters.eventType || filters.status;

  async function handleCopy(id: string) {
    setCopying(id);
    await copyEvent(id);
    setCopying(null);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await deleteEvent(id);
    setDeleting(null);
  }

  const col = (key: SortKey, label: string) => (
    <th className="p-2 text-left">
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className="flex items-center font-bold hover:underline"
      >
        {label}
        <SortIcon active={sortKey === key} dir={sortDir} />
      </button>
    </th>
  );

  return (
    <div className="mt-8 overflow-x-auto">
      {/* Filters */}
      <div className="mb-3 flex flex-wrap gap-2">
        <input
          placeholder="Filter title…"
          value={filters.title}
          onChange={(e) => setFilters((f) => ({ ...f, title: e.target.value }))}
          className="border border-black px-2 py-1 text-sm"
        />
        <select
          value={filters.season}
          onChange={(e) => setFilters((f) => ({ ...f, season: e.target.value }))}
          className="border border-black px-2 py-1 text-sm"
        >
          <option value="">All seasons</option>
          {seasons.map((s) => (
            <option key={s} value={s}>Season {s}</option>
          ))}
        </select>
        <select
          value={filters.eventType}
          onChange={(e) => setFilters((f) => ({ ...f, eventType: e.target.value }))}
          className="border border-black px-2 py-1 text-sm"
        >
          <option value="">All types</option>
          <option value="RUN">Run</option>
          <option value="MEMBER PARTY">Member Party</option>
          <option value="CHEER STATION">Cheer Station</option>
          <option value="MEDAL MONDAY">Medal Monday</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="border border-black px-2 py-1 text-sm"
        >
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="canceled">Canceled</option>
          <option value="completed">Completed</option>
        </select>
        {hasFilter && (
          <button
            type="button"
            onClick={() => setFilters({ title: "", season: "", eventType: "", status: "" })}
            className="border border-black px-2 py-1 text-sm hover:bg-black hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      <table className="w-full border border-black text-sm">
        <thead>
          <tr className="border-b border-black bg-neutral-50 text-left">
            {col("title", "Title")}
            {col("eventType", "Type")}
            {col("startAt", "Date")}
            {col("seasonNumber", "Season")}
            <th className="p-2 text-left font-bold">Location</th>
            {col("status", "Status")}
            <th className="p-2 text-left font-bold" title="Cumulative count of all Runs + Cheer Stations">Total #</th>
            <th className="p-2 text-left font-bold" title="Run number within this season">Season #</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((event) => (
            <tr
              key={event.id}
              onClick={() => router.push(`/admin/events/${event.id}/edit`)}
              className="cursor-pointer border-b border-neutral-200 hover:bg-neutral-50"
            >
              <td className="p-2 font-medium">{event.title}</td>
              <td className="p-2 text-neutral-600">{event.eventType ?? "—"}</td>
              <td className="p-2 whitespace-nowrap">{dateFormatter.format(event.startAt)}</td>
              <td className="p-2">{event.seasonNumber ?? "—"}</td>
              <td className="p-2 text-neutral-600">{event.locationName ?? "—"}</td>
              <td className="p-2">
                <span className={`text-xs font-medium uppercase ${
                  event.status === "canceled" ? "text-red-600" :
                  event.status === "completed" ? "text-neutral-400" : ""
                }`}>
                  {event.status}
                </span>
              </td>
              <td className="p-2 text-neutral-600">
                {totalCountMap.get(event.id) ?? "—"}
              </td>
              <td className="p-2 text-neutral-600">
                {seasonCountMap.get(event.id) ?? "—"}
              </td>
              <td
                className="p-2 text-right whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  title="Copy"
                  disabled={copying === event.id}
                  onClick={() => handleCopy(event.id)}
                  className="mr-2 text-neutral-500 hover:text-black disabled:opacity-40"
                >
                  {copying === event.id ? "…" : "⧉"}
                </button>
                <button
                  type="button"
                  title="Edit"
                  onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                  className="mr-2 text-neutral-500 hover:text-black"
                >
                  ✎
                </button>
                <button
                  type="button"
                  title="Delete"
                  disabled={deleting === event.id}
                  onClick={() => handleDelete(event.id, event.title)}
                  className="text-neutral-500 hover:text-red-600 disabled:opacity-40"
                >
                  {deleting === event.id ? "…" : "✕"}
                </button>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={9} className="p-4 text-center text-neutral-500">
                No events match.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-neutral-500">{sorted.length} of {events.length} events</p>
    </div>
  );
}
