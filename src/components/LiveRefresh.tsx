"use client";

// Keeps a server-rendered page current: re-fetches it every `seconds` while the tab is visible,
// and once straight away when the tab comes back. New pulls and offers show up on their own.
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LiveRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      // never while something is open over the page (a pack being opened, the card viewer)
      if (document.visibilityState === "visible" && !document.querySelector('[aria-modal="true"]')) router.refresh();
    };
    const id = setInterval(tick, seconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);
  return null;
}
