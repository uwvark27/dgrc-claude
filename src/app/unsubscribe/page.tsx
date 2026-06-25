import { unsubscribeByToken } from "./actions";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  const { token, done } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl font-bold uppercase tracking-tight">
          Unsubscribe
        </h1>
        <p className="mt-4 text-neutral-600">Missing unsubscribe link.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl font-bold uppercase tracking-tight">
          Unsubscribe
        </h1>
        <p className="mt-4 text-neutral-600">
          You&apos;ve been removed from the mailing list.
        </p>
      </div>
    );
  }

  const unsubscribeWithToken = unsubscribeByToken.bind(null, token);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Unsubscribe
      </h1>
      <p className="mt-4 text-neutral-600">
        Click below to stop receiving DGRC mailing list emails.
      </p>
      <form action={unsubscribeWithToken} className="mt-6">
        <button
          type="submit"
          className="border border-black bg-black px-6 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Unsubscribe Me
        </button>
      </form>
    </div>
  );
}
