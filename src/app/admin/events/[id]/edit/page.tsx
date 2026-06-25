import { notFound } from "next/navigation";
import { db } from "@/db";
import { locations } from "@/db/schema";
import {
  updateEvent,
  addEventGuest,
  deleteEventGuest,
} from "../../actions";

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

  const [event, allLocations] = await Promise.all([
    db.query.events.findFirst({
      where: (e, { eq }) => eq(e.id, id),
      with: { guests: true },
    }),
    db.select().from(locations).orderBy(locations.name),
  ]);

  if (!event) notFound();

  const updateEventWithId = updateEvent.bind(null, id);
  const addEventGuestWithId = addEventGuest.bind(null, id);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Edit Event
      </h1>

      <form
        action={updateEventWithId}
        className="mt-8 flex max-w-xl flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Title
          <input
            name="title"
            required
            defaultValue={event.title}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea
            name="description"
            defaultValue={event.description ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
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
        <label className="flex flex-col gap-1 text-sm font-medium">
          Location
          <select
            name="locationId"
            defaultValue={event.locationId ?? ""}
            className="border border-black px-3 py-2"
          >
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
              defaultValue={event.seasonNumber ?? ""}
              className="border border-black px-3 py-2"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Event Type
            <input
              name="eventType"
              defaultValue={event.eventType ?? ""}
              className="border border-black px-3 py-2"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isSpecialEvent"
            defaultChecked={event.isSpecialEvent}
          />
          Special event (cookie exchange, beer share, etc.)
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Special Event Details
          <input
            name="specialEventDetails"
            defaultValue={event.specialEventDetails ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Notice
          <input
            name="notice"
            defaultValue={event.notice ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
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
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Save
        </button>
      </form>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Special Guests
      </h2>
      <ul className="mt-4 flex flex-col gap-2 text-sm">
        {event.guests.map((guest) => (
          <li key={guest.id} className="flex items-center justify-between border-b border-neutral-300 py-1">
            <span>
              {guest.name}
              {guest.roleOrBio ? ` — ${guest.roleOrBio}` : ""}
            </span>
            <form action={deleteEventGuest.bind(null, event.id, guest.id)}>
              <button type="submit" className="underline">
                Remove
              </button>
            </form>
          </li>
        ))}
        {event.guests.length === 0 && (
          <li className="text-neutral-500">No guests added.</li>
        )}
      </ul>

      <form action={addEventGuestWithId} className="mt-4 flex max-w-md gap-2">
        <input
          name="name"
          required
          placeholder="Guest name"
          className="flex-1 border border-black px-3 py-2 text-sm"
        />
        <input
          name="roleOrBio"
          placeholder="Role (e.g. sports doctor)"
          className="flex-1 border border-black px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
        >
          Add
        </button>
      </form>
    </div>
  );
}
