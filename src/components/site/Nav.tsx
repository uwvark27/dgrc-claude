import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "./actions";
import { NavShell } from "./NavShell";

const links = [
  { href: "/events", label: "Events" },
  { href: "/run-routes", label: "Routes" },
  { href: "/photos", label: "Photos" },
  { href: "/members", label: "Members" },
  { href: "/discount-codes", label: "Perks" },
  { href: "/about", label: "About" },
];

const linkClass =
  "text-sm font-semibold uppercase tracking-[0.14em] text-paper/80 transition-colors hover:text-gold";

export async function Nav() {
  const session = await auth();
  const user = session?.user;

  return (
    <NavShell
      logo={
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/logo-alt.jpg"
            alt=""
            width={44}
            height={44}
            className="rounded-full"
          />
          <span className="font-display text-2xl tracking-wide">DGRC</span>
        </Link>
      }
      links={
        <>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </>
      }
      actions={
        user ? (
          <>
            <span className="text-sm font-medium text-paper/60">
              {user.name}
            </span>
            {user.role === "admin" && (
              <Link href="/admin" className={linkClass}>
                Admin
              </Link>
            )}
            <form action={logout}>
              <button type="submit" className={linkClass}>
                Log Out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className={linkClass}>
              Log In
            </Link>
            <Link
              href="/register"
              className="btn btn-primary !px-5 !py-2.5 !text-xs"
            >
              Join Us
            </Link>
          </>
        )
      }
    />
  );
}
