import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events, photos } from "@/db/schema";
import { requireClubMember } from "@/lib/require-club-member";
import { auth } from "@/auth";
import { PageHeader } from "@/components/site/PageHeader";
import { UploadForm } from "./UploadForm";

export default async function PhotosPage() {
  const [session, approvedPhotos, allEvents, membership] = await Promise.all([
    auth(),
    db.query.photos.findMany({
      where: eq(photos.approved, true),
      orderBy: (p, { desc }) => [desc(p.uploadedAt)],
      with: { event: true },
    }),
    db.select({ id: events.id, title: events.title }).from(events),
    requireClubMember(),
  ]);

  const groups = new Map<string, typeof approvedPhotos>();
  for (const photo of approvedPhotos) {
    const key = photo.event?.title ?? "Other";
    const list = groups.get(key) ?? [];
    list.push(photo);
    groups.set(key, list);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <PageHeader
        eyebrow="The wall"
        title="Photos"
        lede="Proof that we occasionally run between beers."
      />

      {membership ? (
        <div className="mt-10 border border-line-light bg-cream p-6">
          <h2 className="font-display text-2xl uppercase">Upload a photo</h2>
          <UploadForm events={allEvents} />
        </div>
      ) : session?.user ? (
        <p className="mt-10 text-stone-warm">
          Only linked DGRC members can upload photos. Contact an admin if you
          think this is a mistake.
        </p>
      ) : (
        <p className="mt-10 text-stone-warm">
          <Link
            href="/login"
            className="font-semibold text-gold-deep underline underline-offset-4 hover:text-ink"
          >
            Log in
          </Link>{" "}
          as a club member to upload photos.
        </p>
      )}

      <div className="mt-14 flex flex-col gap-14">
        {Array.from(groups.entries()).map(([groupTitle, groupPhotos]) => (
          <section key={groupTitle}>
            <div className="flex items-baseline gap-4">
              <h2 className="shrink-0 font-display text-2xl uppercase">
                {groupTitle}
              </h2>
              <div className="h-0.5 w-full bg-gold" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {groupPhotos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.blobUrl}
                  alt={photo.caption ?? ""}
                  className="aspect-square w-full border border-line-light object-cover transition-opacity hover:opacity-85"
                />
              ))}
            </div>
          </section>
        ))}
        {approvedPhotos.length === 0 && (
          <p className="text-stone-warm">No photos yet.</p>
        )}
      </div>
    </div>
  );
}
