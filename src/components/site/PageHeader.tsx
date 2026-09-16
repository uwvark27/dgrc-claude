export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-display text-display-lg uppercase">{title}</h1>
      {lede && <p className="mt-4 max-w-2xl text-lg text-stone-warm">{lede}</p>}
    </header>
  );
}
