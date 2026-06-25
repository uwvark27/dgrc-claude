import Link from "next/link";
import { db } from "@/db";
import { perks } from "@/db/schema";
import { createPerk, deletePerk } from "./actions";

export default async function AdminPerksPage() {
  const allPerks = await db.select().from(perks).orderBy(perks.title);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">Perks</h1>
      <p className="mt-2 text-neutral-600">
        Shown publicly on /members as the pitch to join the club.
      </p>

      <table className="mt-8 w-full border border-black text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="p-2">Title</th>
            <th className="p-2">Partner</th>
            <th className="p-2">Season</th>
            <th className="p-2">Active</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {allPerks.map((perk) => (
            <tr key={perk.id} className="border-b border-neutral-300">
              <td className="p-2">{perk.title}</td>
              <td className="p-2">{perk.partnerName}</td>
              <td className="p-2">{perk.season}</td>
              <td className="p-2">{perk.isActive ? "Yes" : "No"}</td>
              <td className="p-2 text-right">
                <Link href={`/admin/perks/${perk.id}/edit`} className="underline">
                  Edit
                </Link>{" "}
                <form action={deletePerk.bind(null, perk.id)} className="inline">
                  <button type="submit" className="underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {allPerks.length === 0 && (
            <tr>
              <td colSpan={5} className="p-2 text-neutral-500">
                No perks yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Add Perk
      </h2>
      <form
        action={createPerk}
        className="mt-4 flex max-w-md flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Title
          <input name="title" required className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea
            name="description"
            required
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Partner Name
          <input name="partnerName" className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Season
          <input name="season" className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Photo
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="border border-black px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Add Perk
        </button>
      </form>
    </div>
  );
}
