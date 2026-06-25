import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events, photos } from "@/db/schema";
import { requireClubMember } from "@/lib/require-club-member";
import { auth } from "@/auth";
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
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold uppercase tracking-tight">Photos</h1>

      {membership ? (
        <div className="mt-8">
          <h2 className="text-xl font-bold uppercase tracking-wide">
            Upload a Photo
          </h2>
          <UploadForm events={allEvents} />
        </div>
      ) : session?.user ? (
        <p className="mt-8 text-neutral-600">
          Only linked DGRC members can upload photos. Contact an admin if you
          think this is a mistake.
        </p>
      ) : (
        <p className="mt-8 text-neutral-600">
          <Link href="/login" className="underline">
            Log in
          </Link>{" "}
          as a club member to upload photos.
        </p>
      )}

      <div className="mt-12 flex flex-col gap-10">
        {Array.from(groups.entries()).map(([groupTitle, groupPhotos]) => (
          <section key={groupTitle}>
            <h2 className="text-xl font-bold uppercase tracking-wide">
              {groupTitle}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {groupPhotos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.blobUrl}
                  alt={photo.caption ?? ""}
                  className="aspect-square w-full border border-black object-cover"
                />
              ))}
            </div>
          </section>
        ))}
        {approvedPhotos.length === 0 && (
          <p className="text-neutral-600">No photos yet.</p>
        )}
      </div>
    </div>
  );
}
