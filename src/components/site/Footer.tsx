export function Footer() {
  return (
    <footer className="border-t border-black">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-600">
        <p>&copy; {new Date().getFullYear()} Dancing Gnome Run Club.</p>
      </div>
    </footer>
  );
}
