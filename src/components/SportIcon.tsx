import type { Sport } from "@/lib/catalog/types";

export function SportIcon({ sport = "basketball", className }: { sport?: Sport; className?: string }) {
  if (sport === "esports")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-label="Esports">
        <path d="M12 2l7 6-7 14-7-14z" />
        <path d="M5 8h14M12 2L9 8l3 14 3-14z" />
      </svg>
    );
  if (sport === "baseball")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="Baseball">
        <circle cx="12" cy="12" r="10" />
        <path d="M6.2 3.9c2.4 2.2 2.4 14 0 16.2M17.8 3.9c-2.4 2.2-2.4 14 0 16.2" />
      </svg>
    );
  if (sport === "hockey")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="Hockey">
        <ellipse cx="12" cy="9" rx="9" ry="4" />
        <path d="M3 9v5c0 2.2 4 4 9 4s9-1.8 9-4V9" />
      </svg>
    );
  if (sport === "football")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="Football">
        <path d="M4.2 19.8C2.6 15 4.4 8.6 8.7 5.6c3.3-2.3 7.8-2.6 11.1-1.4 1.6 4.8-.2 11.2-4.5 14.2-3.3 2.3-7.8 2.6-11.1 1.4z" />
        <path d="M5 5l14 14M9.5 12.5l2 2M11 11l2 2M12.5 9.5l2 2" />
      </svg>
    );
  if (sport === "soccer")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="Soccer">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8l3.8 2.8-1.5 4.4H9.7l-1.5-4.4z" fill="currentColor" />
        <path d="M12 8V2.5M15.8 10.8l5-1.6M14.3 15.2l3 4.3M9.7 15.2l-3 4.3M8.2 10.8l-5-1.6" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="Basketball">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2v20" />
      <path d="M5 4.6c3 2.2 4.4 4.6 4.4 7.4S8 17.2 5 19.4M19 4.6c-3 2.2-4.4 4.6-4.4 7.4s1.4 5.2 4.4 7.4" />
    </svg>
  );
}
