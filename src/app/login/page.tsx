import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold uppercase tracking-tight">Log In</h1>
      <p className="mt-2 text-neutral-600">
        Members and admins log in here.
      </p>
      <LoginForm callbackUrl={callbackUrl ?? "/"} />
    </div>
  );
}
