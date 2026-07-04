"use client";

import { useActionState } from "react";
import { uploadPhoto } from "./actions";

export function UploadForm({
  events,
}: {
  events: { id: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState(uploadPhoto, undefined);

  return (
    <form action={formAction} className="mt-5 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
        Photo
        <input
          type="file"
          name="photo"
          accept="image/*"
          required
          className="border-2 border-line-light bg-paper px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-paper focus:border-gold focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
        Caption
        <input
          name="caption"
          className="border-2 border-line-light bg-paper px-3 py-2 text-base font-normal normal-case tracking-normal text-ink focus:border-gold focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
        Event
        <select
          name="eventId"
          className="border-2 border-line-light bg-paper px-3 py-2.5 text-base font-normal normal-case tracking-normal text-ink focus:border-gold focus:outline-none"
        >
          <option value="">Other</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </label>

      {state?.error && (
        <p className="text-sm font-medium text-rust">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-gold-deep">
          Uploaded! It&apos;ll show up once an admin approves it.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-1 self-start disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Upload Photo"}
      </button>
    </form>
  );
}
