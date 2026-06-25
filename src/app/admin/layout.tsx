import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";

const sections = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/perks", label: "Perks" },
  { href: "/admin/discount-codes", label: "Discount Codes" },
  { href: "/admin/roster", label: "Roster" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/run-routes", label: "Run Routes" },
  { href: "/admin/mailing-list", label: "Mailing List" },
  { href: "/admin/email-templates", label: "Email Templates" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-6 py-12">
      <aside className="w-48 shrink-0">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
          Admin
        </p>
        <nav className="mt-4 flex flex-col gap-2 text-sm">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="hover:underline"
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
