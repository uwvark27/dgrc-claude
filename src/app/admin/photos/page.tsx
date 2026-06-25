import { db } from "@/db";
import { approvePhoto, rejectPhoto } from "./actions";

export default async function AdminPhotosPage() {
  const allPhotos = await db.query.photos.findMany({
    orderBy: (p, { desc }) => [desc(p.uploadedAt)],
    with: { event: true },
  });

  const pending = allPhotos.filter((p) => !p.approved);
  const approved = allPhotos.filter((p) => p.approved);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">Photos</h1>

      <h2 className="mt-8 text-xl font-bold uppercase tracking-wide">
        Pending Approval ({pending.length})
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {pending.map((photo) => (
          <div key={photo.id} className="border border-black p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.blobUrl}
              alt={photo.caption ?? ""}
              className="aspect-square w-full object-cover"
            />
            <p className="mt-2 text-xs text-neutral-600">
              {photo.event?.title ?? "Other"}
            </p>
            {photo.caption && <p className="text-xs">{photo.caption}</p>}
            <div className="mt-2 flex gap-2 text-sm">
              <form action={approvePhoto.bind(null, photo.id)}>
                <button type="submit" className="underline">
                  Approve
                </button>
              </form>
              <form action={rejectPhoto.bind(null, photo.id)}>
                <button type="submit" className="underline">
                  Reject
                </button>
              </form>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <p className="text-neutral-500">Nothing pending.</p>
        )}
      </div>

      <h2 className="mt-12 text-xl font-bold uppercase tracking-wide">
        Approved ({approved.length})
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {approved.map((photo) => (
          <div key={photo.id} className="border border-black p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.blobUrl}
              alt={photo.caption ?? ""}
              className="aspect-square w-full object-cover"
            />
            <p className="mt-2 text-xs text-neutral-600">
              {photo.event?.title ?? "Other"}
            </p>
            <form action={rejectPhoto.bind(null, photo.id)} className="mt-2">
              <button type="submit" className="text-sm underline">
                Remove
              </button>
            </form>
          </div>
        ))}
        {approved.length === 0 && (
          <p className="text-neutral-500">No approved photos yet.</p>
        )}
      </div>
    </div>
  );
}
