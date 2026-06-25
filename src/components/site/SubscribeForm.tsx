"use client";

import { useActionState } from "react";
import { subscribeToMailingList } from "@/lib/subscribe";

export function SubscribeForm() {
  const [state, formAction, pending] = useActionState(
    subscribeToMailingList,
    undefined,
  );

  if (state?.success) {
    return (
      <p className="mt-4 font-medium text-green-700">
        You&apos;re on the list!
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-4 flex max-w-md gap-2">
      <input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="flex-1 border border-black px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black disabled:opacity-50"
      >
        {pending ? "Joining..." : "Subscribe"}
      </button>
      {state?.error && (
        <p className="text-sm font-medium text-red-700">{state.error}</p>
      )}
    </form>
  );
}
