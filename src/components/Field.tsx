import type { ReactNode } from "react";

export function Field({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-4 rounded-md py-2">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-700 dark:text-ink-50">{label}</span>
        {description ? <span className="mt-0.5 block max-w-md text-xs leading-5 text-ink-500 dark:text-ink-200">{description}</span> : null}
      </span>
      {children}
    </label>
  );
}
