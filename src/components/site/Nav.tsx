import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "./actions";

const links = [
  { href: "/events", label: "Events" },
  { href: "/members", label: "Members" },
  { href: "/discount-codes", label: "Discount Codes" },
  { href: "/photos", label: "Photos" },
  { href: "/run-routes", label: "Run Routes" },
  { href: "/about", label: "About Us" },
];

export async function Nav() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b border-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4 sm:contents">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide"
          >
            <Image
              src="/logo-alt.jpg"
              alt="DGRC"
              width={36}
              height={36}
              className="rounded-full"
            />
            DGRC
          </Link>
          {user ? (
            <div className="flex items-center gap-3 sm:order-3">
              <span className="text-sm font-medium">
                Signed in as {user.name}
              </span>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
                >
                  Admin
                </Link>
              )}
              <form action={logout}>
                <button
                  type="submit"
                  className="border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
                >
                  Log Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white sm:order-3"
            >
              Login
            </Link>
          )}
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium uppercase tracking-wide">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
