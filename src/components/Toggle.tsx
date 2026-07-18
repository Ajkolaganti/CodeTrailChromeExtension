export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trail-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] dark:focus-visible:ring-offset-ink-900 ${
        checked ? "bg-trail-600 shadow-inner" : "bg-ink-200 dark:bg-ink-700"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition duration-200 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
