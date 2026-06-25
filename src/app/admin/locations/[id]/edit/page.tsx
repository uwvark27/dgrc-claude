import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { updateLocation } from "../../actions";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, id))
    .limit(1);

  if (!location) notFound();

  const updateLocationWithId = updateLocation.bind(null, id);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Edit Location
      </h1>

      <form
        action={updateLocationWithId}
        className="mt-8 flex max-w-md flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input
            name="name"
            required
            defaultValue={location.name}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Address
          <input
            name="address"
            defaultValue={location.address ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Notes
          <textarea
            name="notes"
            defaultValue={location.notes ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Save
        </button>
      </form>
    </div>
  );
}
