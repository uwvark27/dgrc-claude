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
    <form action={formAction} className="mt-4 flex max-w-md flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Photo
        <input
          type="file"
          name="photo"
          accept="image/*"
          required
          className="border border-black px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Caption
        <input name="caption" className="border border-black px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Event
        <select name="eventId" className="border border-black px-3 py-2">
          <option value="">Other</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </label>

      {state?.error && (
        <p className="text-sm font-medium text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-green-700">
          Uploaded! It&apos;ll show up once an admin approves it.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Upload Photo"}
      </button>
    </form>
  );
}
