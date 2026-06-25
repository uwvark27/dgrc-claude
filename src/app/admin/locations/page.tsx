import Link from "next/link";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { createLocation, deleteLocation } from "./actions";

export default async function AdminLocationsPage() {
  const allLocations = await db.select().from(locations).orderBy(locations.name);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Locations
      </h1>
      <p className="mt-2 text-neutral-600">
        Meeting/start locations used when creating events.
      </p>

      <table className="mt-8 w-full border border-black text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Address</th>
            <th className="p-2">Notes</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {allLocations.map((location) => (
            <tr key={location.id} className="border-b border-neutral-300">
              <td className="p-2">{location.name}</td>
              <td className="p-2">{location.address}</td>
              <td className="p-2">{location.notes}</td>
              <td className="p-2 text-right">
                <Link
                  href={`/admin/locations/${location.id}/edit`}
                  className="underline"
                >
                  Edit
                </Link>{" "}
                <form
                  action={deleteLocation.bind(null, location.id)}
                  className="inline"
                >
                  <button type="submit" className="underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {allLocations.length === 0 && (
            <tr>
              <td colSpan={4} className="p-2 text-neutral-500">
                No locations yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Add Location
      </h2>
      <form action={createLocation} className="mt-4 flex max-w-md flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input name="name" required className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Address
          <input name="address" className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Notes
          <textarea name="notes" className="border border-black px-3 py-2" />
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Add Location
        </button>
      </form>
    </div>
  );
}
