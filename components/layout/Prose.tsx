interface ProseProps {
  children: React.ReactNode;
  className?: string;
}

export function Prose({ children, className }: ProseProps) {
  return (
    <div
      className={`mx-auto max-w-[680px] text-lg leading-[1.55] text-[var(--fg)] [&>p]:mb-5 [&>p:last-child]:mb-0 [&_em]:italic ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
