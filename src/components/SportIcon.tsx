import type { Sport } from "@/lib/catalog/types";

export function SportIcon({ className }: { sport?: Sport; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="Basketball">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2v20" />
      <path d="M5 4.6c3 2.2 4.4 4.6 4.4 7.4S8 17.2 5 19.4M19 4.6c-3 2.2-4.4 4.6-4.4 7.4s1.4 5.2 4.4 7.4" />
    </svg>
  );
}
