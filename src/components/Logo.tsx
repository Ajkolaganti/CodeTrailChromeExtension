export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-14 w-14" : "h-10 w-10";

  return (
    <img src="/icon.svg" alt="" aria-hidden="true" className={`${dimensions} block rounded-lg shadow-sm`} />
  );
}
