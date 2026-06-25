import Link from "next/link";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { getEvents } from "@/lib/events";
import { createEvent, deleteEvent } from "./actions";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminEventsPage() {
  const [allEvents, allLocations] = await Promise.all([
    getEvents(),
    db.select().from(locations).orderBy(locations.name),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">Events</h1>

      <table className="mt-8 w-full border border-black text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="p-2">Title</th>
            <th className="p-2">When</th>
            <th className="p-2">Status</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {allEvents.map((event) => (
            <tr key={event.id} className="border-b border-neutral-300">
              <td className="p-2">{event.title}</td>
              <td className="p-2">{dateFormatter.format(event.startAt)}</td>
              <td className="p-2">{event.status}</td>
              <td className="p-2 text-right">
                <Link href={`/admin/events/${event.id}/edit`} className="underline">
                  Edit
                </Link>{" "}
                <form action={deleteEvent.bind(null, event.id)} className="inline">
                  <button type="submit" className="underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {allEvents.length === 0 && (
            <tr>
              <td colSpan={4} className="p-2 text-neutral-500">
                No events yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Add Event
      </h2>
      <form action={createEvent} className="mt-4 flex max-w-xl flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Title
          <input name="title" required className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea name="description" className="border border-black px-3 py-2" />
        </label>
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Starts
            <input
              type="datetime-local"
              name="startAt"
              required
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
        <label className="flex flex-col gap-1 text-sm font-medium">
          Location
          <select name="locationId" className="border border-black px-3 py-2">
            <option value="">— None —</option>
            {allLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Season #
            <input
              type="number"
              name="seasonNumber"
              className="border border-black px-3 py-2"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Event Type
            <input
              name="eventType"
              placeholder="e.g. group run, race"
              className="border border-black px-3 py-2"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isSpecialEvent" />
          Special event (cookie exchange, beer share, etc.)
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Special Event Details
          <input
            name="specialEventDetails"
            placeholder="e.g. cookie exchange after the run"
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Notice
          <input
            name="notice"
            placeholder="e.g. limited parking this week"
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Status
          <select name="status" defaultValue="scheduled" className="border border-black px-3 py-2">
            <option value="scheduled">Scheduled</option>
            <option value="canceled">Canceled</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Add Event
        </button>
      </form>
    </div>
  );
}
