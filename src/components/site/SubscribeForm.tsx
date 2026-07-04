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
      <p className="mt-6 font-semibold uppercase tracking-wide text-gold">
        You&apos;re on the list!
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-wrap gap-3">
      <input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="min-w-0 flex-1 border-2 border-paper/30 bg-paper px-4 py-3 text-ink placeholder:text-stone-warm focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary disabled:opacity-50"
      >
        {pending ? "Joining..." : "Subscribe"}
      </button>
      {state?.error && (
        <p className="w-full text-sm font-medium text-rust">{state.error}</p>
      )}
    </form>
  );
}
