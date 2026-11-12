import type { Sport } from "@/lib/catalog/types";

export function SportIcon({ sport, className }: { sport: Sport; className?: string }) {
  if (sport === "soccer") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="Soccer">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7.2l4.2 3-1.6 5h-5.2l-1.6-5z" fill="currentColor" fillOpacity=".9" />
        <path d="M12 7.2V2.3M16.2 10.2l4.6-1.6M14.6 15.2l2.8 4M9.4 15.2l-2.8 4M7.8 10.2L3.2 8.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="Basketball">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2v20" />
      <path d="M5 4.6c3 2.2 4.4 4.6 4.4 7.4S8 17.2 5 19.4M19 4.6c-3 2.2-4.4 4.6-4.4 7.4s1.4 5.2 4.4 7.4" />
    </svg>
  );
}
