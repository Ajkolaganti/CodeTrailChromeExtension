import type { CodeTrailSettings } from "../types";

export function applyTheme(theme: CodeTrailSettings["theme"]) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && prefersDark));
}
