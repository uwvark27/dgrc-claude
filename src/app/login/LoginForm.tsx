"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginUser } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(loginUser, undefined);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
        {pending ? "Logging in..." : "Log In"}
      </button>

      <p className="mt-2 text-sm text-neutral-600">
        Not a member yet?{" "}
        <Link href="/register" className="underline">
          Join the club
        </Link>
      </p>
    </form>
  );
}
