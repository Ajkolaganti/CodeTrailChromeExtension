import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: ReactNode;
}

export function Button({ variant = "primary", icon, className = "", children, ...props }: ButtonProps) {
  const styles = {
    primary: "bg-ink-900 text-white shadow-sm hover:bg-ink-700 dark:bg-trail-600 dark:text-ink-900 dark:hover:bg-trail-500",
    secondary:
      "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50 dark:hover:bg-ink-700",
    danger:
      "border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-ink-800 dark:text-red-300 dark:hover:bg-red-950/60",
    ghost: "text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-ink-50"
  }[variant];

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-trail-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:focus-visible:ring-offset-ink-900 ${styles} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
