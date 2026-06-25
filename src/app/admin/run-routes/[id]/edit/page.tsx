import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { runRoutes } from "@/db/schema";
import { updateRunRoute } from "../../actions";

export default async function EditRunRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [route] = await db
    .select()
    .from(runRoutes)
    .where(eq(runRoutes.id, id))
    .limit(1);

  if (!route) notFound();

  const updateRunRouteWithId = updateRunRoute.bind(null, id);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Edit Run Route
      </h1>

      {route.gpxBlobUrl && (
        <p className="mt-4 text-sm text-neutral-600">
          Current GPX:{" "}
          <a href={route.gpxBlobUrl} className="underline">
            download
          </a>
        </p>
      )}

      <form
        action={updateRunRouteWithId}
        className="mt-6 flex max-w-md flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input
            name="name"
            required
            defaultValue={route.name}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Distance (miles)
          <input
            name="distanceMiles"
            type="number"
            step="0.1"
            defaultValue={route.distanceMiles ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Difficulty
          <input
            name="difficulty"
            defaultValue={route.difficulty ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea
            name="description"
            defaultValue={route.description ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Start Address
          <input
            name="startAddress"
            defaultValue={route.startAddress ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          RunGo URL
          <input
            name="runGoUrl"
            defaultValue={route.runGoUrl ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Replace GPX File
          <input type="file" name="gpx" accept=".gpx" className="border border-black px-3 py-2" />
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
