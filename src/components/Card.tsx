import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-ink-200 bg-white/95 p-4 shadow-panel dark:border-ink-700 dark:bg-ink-900/95 ${className}`}>
      {children}
    </section>
  );
}
