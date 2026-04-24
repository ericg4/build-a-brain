interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <header className="mb-10">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.15em] text-[var(--accent)]">
        {eyebrow}
      </p>
      <h2 className="font-heading text-4xl font-semibold leading-tight text-[var(--fg)] md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-lg text-[var(--fg-muted)]">{subtitle}</p>
      )}
    </header>
  );
}
