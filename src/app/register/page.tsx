"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    registerUser,
    undefined,
  );

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Join the Club
      </h1>
      <p className="mt-2 text-neutral-600">
        Create a member account to RSVP for events and upload photos.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input
            name="name"
            required
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="border border-black px-3 py-2"
          />
        </label>

        {state?.error && (
          <p className="text-sm font-medium text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 border border-black bg-black px-6 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        Already a member?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
