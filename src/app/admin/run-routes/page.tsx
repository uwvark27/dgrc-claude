import Link from "next/link";
import { db } from "@/db";
import { runRoutes } from "@/db/schema";
import { createRunRoute, deleteRunRoute } from "./actions";

export default async function AdminRunRoutesPage() {
  const allRoutes = await db.select().from(runRoutes).orderBy(runRoutes.name);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Run Routes
      </h1>

      <table className="mt-8 w-full border border-black text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Distance</th>
            <th className="p-2">Difficulty</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {allRoutes.map((route) => (
            <tr key={route.id} className="border-b border-neutral-300">
              <td className="p-2">{route.name}</td>
              <td className="p-2">{route.distanceMiles} mi</td>
              <td className="p-2">{route.difficulty}</td>
              <td className="p-2 text-right">
                <Link href={`/admin/run-routes/${route.id}/edit`} className="underline">
                  Edit
                </Link>{" "}
                <form action={deleteRunRoute.bind(null, route.id)} className="inline">
                  <button type="submit" className="underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {allRoutes.length === 0 && (
            <tr>
              <td colSpan={4} className="p-2 text-neutral-500">
                No routes yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Add Route
      </h2>
      <form action={createRunRoute} className="mt-4 flex max-w-md flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input name="name" required className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Distance (miles)
          <input
            name="distanceMiles"
            type="number"
            step="0.1"
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Difficulty
          <input name="difficulty" placeholder="Easy, Moderate, Hard" className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea name="description" className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Start Address
          <input name="startAddress" className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          RunGo URL
          <input name="runGoUrl" placeholder="https://rungo.com/..." className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          GPX File (optional)
          <input type="file" name="gpx" accept=".gpx" className="border border-black px-3 py-2" />
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Add Route
        </button>
      </form>
    </div>
  );
}
