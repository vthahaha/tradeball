"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/", label: "Packs", icon: "▣" },
  { href: "/collection", label: "Binder", icon: "▤" },
  { href: "/trades", label: "Trades", icon: "⇄" },
  { href: "/league", label: "League", icon: "★" },
];

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="ml-1.5 rounded-full bg-accent px-1.5 py-px text-xs text-accent-ink" aria-label={`${n} new offers`}>
      {n}
    </span>
  );
}

export function Nav({ username, pendingTrades = 0 }: { username: string | null; pendingTrades?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="font-display text-2xl leading-none">
            TRADE<span className="text-accent">BALL</span>
          </Link>
          {username && (
            <nav className="hidden gap-1 sm:flex" aria-label="Main">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 font-cond text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive(l.href) ? "bg-panel-2 text-text" : "text-muted hover:text-text"
                  }`}
                >
                  {l.label}
                  {l.href === "/trades" && <Badge n={pendingTrades} />}
                </Link>
              ))}
            </nav>
          )}
          {username && (
            <div className="ml-auto flex items-center gap-4">
              <Link
                href={`/u/${encodeURIComponent(username)}`}
                className="font-cond text-sm text-muted hover:text-text"
              >
                @<span className="font-bold text-text">{username}</span>
              </Link>
              <button onClick={logout} className="font-cond text-xs uppercase tracking-wider text-muted hover:text-text">
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Phone tab bar */}
      {username && (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`relative flex flex-col items-center gap-0.5 py-2 font-cond text-xs font-bold uppercase tracking-wider ${
                isActive(l.href) ? "text-accent" : "text-muted"
              }`}
            >
              <span className="text-lg leading-none" aria-hidden>
                {l.icon}
              </span>
              {l.label}
              {l.href === "/trades" && pendingTrades > 0 && (
                <span className="absolute right-[22%] top-1 size-2 rounded-full bg-accent" aria-label={`${pendingTrades} new offers`} />
              )}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
