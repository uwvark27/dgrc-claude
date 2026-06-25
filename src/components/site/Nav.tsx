import Link from "next/link";

const links = [
  { href: "/events", label: "Events" },
  { href: "/members", label: "Members" },
  { href: "/discount-codes", label: "Discount Codes" },
  { href: "/photos", label: "Photos" },
  { href: "/run-routes", label: "Run Routes" },
  { href: "/about", label: "About Us" },
];

export function Nav() {
  return (
    <header className="border-b border-black">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold uppercase tracking-wide">
          DGRC
        </Link>
        <nav className="hidden gap-6 text-sm font-medium uppercase tracking-wide md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
