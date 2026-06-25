import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { perks } from "@/db/schema";
import { updatePerk } from "../../actions";

export default async function EditPerkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [perk] = await db.select().from(perks).where(eq(perks.id, id)).limit(1);

  if (!perk) notFound();

  const updatePerkWithId = updatePerk.bind(null, id);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Edit Perk
      </h1>

      {perk.photoBlobUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={perk.photoBlobUrl}
          alt={perk.title}
          className="mt-4 h-40 w-auto border border-black object-cover"
        />
      )}

      <form
        action={updatePerkWithId}
        className="mt-6 flex max-w-md flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Title
          <input
            name="title"
            required
            defaultValue={perk.title}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea
            name="description"
            required
            defaultValue={perk.description}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Partner Name
          <input
            name="partnerName"
            defaultValue={perk.partnerName ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Season
          <input
            name="season"
            defaultValue={perk.season ?? ""}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Replace Photo
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isActive" defaultChecked={perk.isActive} />
          Active
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
