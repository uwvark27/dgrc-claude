import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { perks } from "@/db/schema";

export default async function MembersPage() {
  const activePerks = await db
    .select()
    .from(perks)
    .where(eq(perks.isActive, true))
    .orderBy(perks.title);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold uppercase tracking-tight">
        Why Join DGRC
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-neutral-700">
        Membership in the Dancing Gnome Running Club comes with real perks
        from our partners — here&apos;s a taste of what current members get.
      </p>
      <Link
        href="/register"
        className="mt-6 inline-block border border-black bg-black px-6 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
      >
        Create an Account
      </Link>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {activePerks.map((perk) => (
          <article key={perk.id} className="border border-black p-5">
            {perk.photoBlobUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={perk.photoBlobUrl}
                alt={perk.title}
                className="mb-4 h-40 w-full border border-black object-cover"
              />
            )}
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              {perk.partnerName}
              {perk.season ? ` · ${perk.season}` : ""}
            </p>
            <h2 className="mt-1 text-xl font-bold uppercase tracking-tight">
              {perk.title}
            </h2>
            <p className="mt-2 text-neutral-700">{perk.description}</p>
          </article>
        ))}
        {activePerks.length === 0 && (
          <p className="text-neutral-600">Perks coming soon.</p>
        )}
      </div>
    </div>
  );
}
