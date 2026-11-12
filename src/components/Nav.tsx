"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BinderIcon, SwapIcon, TicketIcon, TrophyIcon } from "./Icons";

const LINKS = [
  { href: "/", label: "Packs", Icon: TicketIcon },
  { href: "/collection", label: "Binder", Icon: BinderIcon },
  { href: "/trades", label: "Trades", Icon: SwapIcon },
  { href: "/league", label: "League", Icon: TrophyIcon },
];

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span
      className="ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-stamp px-1 text-[0.7rem] font-black text-ink"
      aria-label={`${n} new offers`}
    >
      {n}
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-[1.45rem] leading-none tracking-tight ${className}`} style={{ fontStretch: "135%" }}>
      Gate <span className="text-accent">7</span>
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
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4">
          <Link href="/" aria-label="Gate 7 home">
            <Wordmark />
          </Link>
          {username && (
            <nav className="hidden h-full items-stretch gap-1 sm:flex" aria-label="Main">
              {LINKS.map((l) => {
                const on = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={on ? "page" : undefined}
                    className={`relative flex items-center px-3 font-cond text-[0.95rem] font-extrabold uppercase tracking-[0.08em] transition-colors ${
                      on ? "text-text" : "text-muted hover:text-text"
                    }`}
                  >
                    {l.label}
                    {l.href === "/trades" && <Badge n={pendingTrades} />}
                    {on && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-accent" aria-hidden />}
                  </Link>
                );
              })}
            </nav>
          )}
          {username && (
            <div className="ml-auto flex items-center gap-4">
              <Link
                href={`/u/${encodeURIComponent(username)}`}
                className="font-cond text-[0.95rem] font-bold text-muted transition-colors hover:text-text"
              >
                @<span className="text-text">{username}</span>
              </Link>
              <button
                onClick={logout}
                className="whitespace-nowrap font-cond text-xs font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-text"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
        <div className="perf" aria-hidden />
      </header>

      {/* Phone tab bar */}
      {username && (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 bg-bg-2/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
        >
          <div className="perf absolute inset-x-0 top-0" aria-hidden />
          {LINKS.map(({ href, label, Icon }) => {
            const on = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 pb-2 pt-2.5 font-cond text-[0.7rem] font-extrabold uppercase tracking-[0.1em] ${
                  on ? "text-accent" : "text-muted"
                }`}
              >
                <Icon className="size-6" />
                {label}
                {href === "/trades" && pendingTrades > 0 && (
                  <span
                    className="absolute right-[24%] top-1.5 size-2.5 rounded-full bg-stamp"
                    aria-label={`${pendingTrades} new offers`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
