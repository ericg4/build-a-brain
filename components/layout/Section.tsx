interface SectionProps {
  id?: string;
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}

export function Section({ id, children, wide, className }: SectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-16 px-6 py-20 md:py-28 ${className ?? ""}`}
    >
      <div
        className={`mx-auto ${wide ? "max-w-[1100px]" : "max-w-[680px]"}`}
      >
        {children}
      </div>
    </section>
  );
}
