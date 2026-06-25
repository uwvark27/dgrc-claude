import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-5xl font-bold uppercase tracking-tight">404</h1>
      <p className="mt-4 text-neutral-600">
        That page took a wrong turn somewhere.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block border border-black bg-black px-6 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
      >
        Back Home
      </Link>
    </div>
  );
}
