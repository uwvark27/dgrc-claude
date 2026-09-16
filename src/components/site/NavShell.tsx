"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Client shell for the nav: owns scroll-aware transparency (over the home
// hero) and the mobile menu. Auth-dependent content is rendered on the
// server in Nav.tsx and passed in as slots.
export function NavShell({
  logo,
  links,
  actions,
}: {
  logo: ReactNode;
  links: ReactNode;
  actions: ReactNode;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Close the menu when the route changes (state-adjustment-during-render
  // pattern, per react.dev "You Might Not Need an Effect").
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Only the homepage has a full-bleed hero to float over.
  const overlaysHero = pathname === "/";
  const solid = !overlaysHero || scrolled || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    // rAF instead of a direct call: syncs state for pages that load
    // pre-scrolled without setState-in-effect cascading renders.
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 text-paper transition-colors duration-300 ${
        solid
          ? "bg-ink shadow-[0_1px_0_0_var(--color-line)]"
          : "bg-gradient-to-b from-ink/70 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6">
        {logo}
        <nav className="hidden items-center gap-7 lg:flex">{links}</nav>
        <div className="hidden items-center gap-5 lg:flex">{actions}</div>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 p-2 lg:hidden"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden
          >
            {open ? (
              <>
                <path d="M5 5l14 14" />
                <path d="M19 5L5 19" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div
          className="border-t border-line bg-ink px-6 pb-8 pt-6 lg:hidden"
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest("a, button[type=submit]")) {
              setOpen(false);
            }
          }}
        >
          <nav className="flex flex-col items-start gap-5">{links}</nav>
          <div className="mt-6 flex flex-col items-start gap-5 border-t border-line pt-6">
            {actions}
          </div>
        </div>
      )}
    </header>
  );
}
