"use client";

import { useActionState } from "react";
import { sendEmailTemplate } from "../../actions";

export function SendButton({
  templateId,
  recipientCount,
}: {
  templateId: string;
  recipientCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    async () => sendEmailTemplate(templateId),
    undefined,
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending || recipientCount === 0}
        className="border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black disabled:opacity-50"
      >
        {pending
          ? "Sending..."
          : `Send to ${recipientCount} subscriber${recipientCount === 1 ? "" : "s"}`}
      </button>
      {state?.error && (
        <p className="mt-2 text-sm font-medium text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="mt-2 text-sm font-medium text-green-700">
          Sent to {state.sentCount} subscriber{state.sentCount === 1 ? "" : "s"}.
        </p>
      )}
    </form>
  );
}
