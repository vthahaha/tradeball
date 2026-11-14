"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NUMBERED_FINISHES, SHARDS_PER_PACK, shardValueFor } from "@/lib/odds";
import { useEffect, useMemo, useState } from "react";
import { INSERT_NAMES, INSERT_TYPES, teamColors, type CardView } from "@/lib/catalog";
import { isInsert, RARITIES, type Finish, type Rarity } from "@/lib/catalog/types";
import { PinIcon, RecycleIcon, ShardIcon, StarIcon } from "./Icons";
import { Card, TurnableCard } from "./Card";
import { SetIcon } from "./CardArt";

export interface OwnedCopy {
  instanceId: string;
  designId: string;
  finish: Finish;
  serialNo: number | null;
  supply: number | null;
  grade: number;
  pulledAt: string;
  pulledBy: string;
}

const FINISH_RANK: Record<Finish, number> = { standard: 0, foil: 1, holo: 2, gold: 3, black: 4, masterpiece: 5 };
const RARITY_COLOR: Record<Rarity, string> = {
  common: "var(--r-common)",
  uncommon: "var(--r-uncommon)",
  rare: "var(--r-rare)",
  epic: "var(--r-epic)",
  legendary: "var(--r-legendary)",
  mythic: "var(--r-mythic)",
  grail: "var(--r-grail)",
};

type SortKey = "rarity" | "ovr" | "newest" | "name";
type GroupKey = "set" | "team" | "rarity" | "none";

function groupTitle(group: GroupKey, k: string) {
  if (group === "set") return k === "base" ? "Base set" : k === "rookie" ? "Rookies" : (INSERT_NAMES[k] ?? k);
  if (group === "rarity") return k[0].toUpperCase() + k.slice(1);
  return k;
}

/** A binder page header: the team's colours or the set's mark, then owned / total. */
function GroupHead({ group, k, owned, total }: { group: GroupKey; k: string; owned: number; total: number }) {
  const [t1, t2] = group === "team" ? teamColors(k) : ["", ""];
  const pct = total ? Math.round((owned / total) * 100) : 0;
  return (
    <header className="flex items-center gap-3 border-b-2 border-dashed border-line pb-3">
      {group === "team" && (
        <span className="flex h-9 w-6 shrink-0 overflow-hidden rounded-sm" aria-hidden>
          <span className="flex-1" style={{ background: t1 }} />
          <span className="w-2" style={{ background: t2 }} />
        </span>
      )}
      {group === "rarity" && <span className="size-4 shrink-0 rounded-full" style={{ background: RARITY_COLOR[k as Rarity] }} aria-hidden />}
      {group === "set" && isInsert(k) && (
        <span className="tb-binder__seticon grid size-9 shrink-0 place-items-center rounded-md bg-panel-2 text-accent" aria-hidden>
          <SetIcon type={k} />
        </span>
      )}
      <h2 className="min-w-0 truncate font-display text-2xl leading-none sm:text-3xl">{groupTitle(group, k)}</h2>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        <span className="font-cond text-sm font-bold text-muted">
          <span className="text-text">{owned}</span>/{total}
        </span>
        <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-bg-2 sm:block" aria-hidden>
          <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(owned ? 4 : 0, pct)}%` }} />
        </span>
      </div>
    </header>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2">
      <span className="field-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-48 rounded-full border border-line bg-bg-2 px-3 py-1.5 font-cond text-sm font-bold uppercase tracking-wider outline-none focus:border-accent"
      >
        {children}
      </select>
    </label>
  );
}


/** Best copy first: rarest finish, then grade. */
function bestCopy(copies: OwnedCopy[]) {
  return [...copies].sort((a, b) => FINISH_RANK[b.finish] - FINISH_RANK[a.finish] || b.grade - a.grade)[0];
}

function Chip({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 font-cond text-sm font-bold uppercase tracking-wider transition-colors ${
        active ? "border-transparent bg-text text-bg" : "border-line text-muted hover:text-text"
      }`}
    >
      {color && <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: color }} />}
      {children}
    </button>
  );
}

export function CollectionView({
  designs,
  copies,
  packsOpened,
  wishes,
  owners,
  wanters,
  shards,
  showcase,
  locked,
}: {
  designs: CardView[];
  copies: OwnedCopy[];
  packsOpened: number;
  wishes: string[];
  owners: Record<string, string[]>;
  wanters: Record<string, string[]>;
  shards: number;
  showcase: string[];
  locked: string[];
}) {
  const router = useRouter();
  const [wishSet, setWishSet] = useState(() => new Set(wishes));
  const [wishOnly, setWishOnly] = useState(false);
  const [recycleOpen, setRecycleOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showcaseList, setShowcaseList] = useState(showcase);
  const lockedSet = useMemo(() => new Set(locked), [locked]);

  async function toggleShowcase(id: string) {
    const on = !showcaseList.includes(id);
    const res = await fetch("/api/showcase", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, on }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setToast(data.error ?? "Couldn't update showcase");
    setShowcaseList(data.showcase);
    setToast(on ? "Pinned to your showcase" : "Removed from your showcase");
  }

  async function recycleOne(id: string) {
    const res = await fetch("/api/recycle", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setToast(data.error ?? "Couldn't recycle");
    setToast(recycleMessage(data));
    router.refresh();
  }

  async function toggleWish(designId: string) {
    const on = !wishSet.has(designId);
    setWishSet((s) => {
      const n = new Set(s);
      if (on) n.add(designId);
      else n.delete(designId);
      return n;
    });
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ designId, on }),
    });
  }

  const [setFilter, setSetFilter] = useState<string>("all"); // all | base | rookie | insert | <insert class id>
  const [team, setTeam] = useState<string>("all");
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [group, setGroup] = useState<GroupKey>("set");
  const [showMissing, setShowMissing] = useState(true);
  const [dupesOnly, setDupesOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("rarity");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const byDesign = useMemo(() => {
    const m = new Map<string, OwnedCopy[]>();
    for (const c of copies) m.set(c.designId, [...(m.get(c.designId) ?? []), c]);
    return m;
  }, [copies]);

  const stats = useMemo(() => {
    const per = (t: "base" | "rookie" | "insert") => {
      const all = designs.filter((d) => (t === "insert" ? isInsert(d.type) : d.type === t));
      return { owned: all.filter((d) => byDesign.has(d.designId)).length, total: all.length };
    };
    return { base: per("base"), rookie: per("rookie"), insert: per("insert") };
  }, [designs, byDesign]);
  const hasInserts = stats.insert.total > 0;
  const teams = useMemo(() => [...new Set(designs.map((d) => d.team).filter(Boolean))].sort(), [designs]);

  // Everything the filters allow, owned or not: group headers count against this.
  const scope = useMemo(() => {
    const q = query.trim().toLowerCase();
    return designs.filter((d) => {
      if (wishOnly && !wishSet.has(d.designId)) return false;
      if (setFilter === "insert" ? !isInsert(d.type) : setFilter !== "all" && d.type !== setFilter) return false;
      if (team !== "all" && d.team !== team) return false;
      if (rarity !== "all" && d.rarity !== rarity) return false;
      if (q && !d.players.some((p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [designs, setFilter, team, rarity, query, wishOnly, wishSet]);

  const groups = useMemo(() => {
    const shown = scope.filter((d) => {
      const owned = byDesign.get(d.designId);
      if (!showMissing && !owned && !wishOnly) return false;
      if (dupesOnly && (owned?.length ?? 0) < 2) return false;
      return true;
    });
    const newest = (d: CardView) => byDesign.get(d.designId)?.[0]?.pulledAt ?? "";
    const cmp = (a: CardView, b: CardView) => {
      switch (sort) {
        case "rarity":
          return RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) || b.ovr - a.ovr;
        case "ovr":
          return b.ovr - a.ovr;
        case "newest":
          return newest(b).localeCompare(newest(a)) || b.ovr - a.ovr;
        case "name":
          return a.players[0].name.localeCompare(b.players[0].name);
      }
    };
    const keyOf = (d: CardView) => (group === "team" ? d.team || "Legends" : group === "rarity" ? d.rarity : group === "set" ? d.type : "all");
    const order = (k: string) =>
      group === "rarity" ? -RARITIES.indexOf(k as Rarity) : group === "set" ? (k === "base" ? -2 : k === "rookie" ? -1 : INSERT_TYPES.indexOf(k)) : 0;
    const map = new Map<string, { cards: CardView[]; owned: number; total: number }>();
    for (const d of scope) {
      const k = keyOf(d);
      const g = map.get(k) ?? { cards: [], owned: 0, total: 0 };
      g.total++;
      if (byDesign.has(d.designId)) g.owned++;
      map.set(k, g);
    }
    for (const d of shown) map.get(keyOf(d))!.cards.push(d);
    return [...map.entries()]
      .filter(([, g]) => g.cards.length > 0)
      .sort(([a], [b]) => order(a) - order(b) || a.localeCompare(b))
      .map(([key, g]) => ({ key, ...g, cards: g.cards.sort(cmp) }));
  }, [scope, byDesign, showMissing, dupesOnly, wishOnly, group, sort]);
  const shownCount = groups.reduce((n, g) => n + g.cards.length, 0);

  const openDesign = open ? designs.find((d) => d.designId === open) : null;

  return (
    <>
      {/* Completion, as one season-ticket strip */}
      <section aria-label="Set completion" className="ticket-panel mt-5">
        <div className={`grid ${hasInserts ? "grid-cols-3" : "grid-cols-2"}`}>
          {(
            [
              ["base", "Base set"],
              ["rookie", "Rookies"],
              ["insert", "Inserts"],
            ] as const
          )
            .filter(([s]) => s !== "insert" || hasInserts)
            .map(([s, label]) => {
            const { owned, total } = stats[s];
            return (
              <div key={s} className="border-r-2 border-dashed border-line px-3 py-3 last:border-r-0 sm:px-5 sm:py-4">
                <div className="field-label">{label}</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-2xl leading-none sm:text-3xl">{owned}</span>
                  <span className="font-cond text-sm text-muted">/{total}</span>
                  <span className="ml-auto hidden font-cond text-sm text-muted sm:inline">{Math.round((owned / total) * 100)}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-2">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(2, (owned / total) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="perf" aria-hidden />
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5">
          <span className="font-cond text-sm font-semibold text-muted" title={`${SHARDS_PER_PACK} shards = 1 bonus pack`}>
            <span className="text-text">{copies.length}</span> cards
            <span className="hidden sm:inline"> from {packsOpened} packs</span>
            <span className="mx-2 text-line">·</span>
            <ShardIcon className="mr-1 inline size-4 align-[-3px]" />
            {shards}/{SHARDS_PER_PACK} shards
          </span>
          <button
            type="button"
            onClick={() => setRecycleOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-cond text-sm font-extrabold uppercase tracking-wider text-accent hover:underline"
          >
            <RecycleIcon className="size-4" />
            Recycle dupes
          </button>
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            className="fixed inset-x-0 bottom-20 z-[70] mx-auto w-fit max-w-[90vw] rounded-full border border-line bg-panel-2 px-4 py-2 font-cond font-bold shadow-xl sm:bottom-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onAnimationComplete={() => setTimeout(() => setToast(null), 2600)}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {recycleOpen && (
          <RecycleDialog
            onClose={() => setRecycleOpen(false)}
            onDone={(msg) => {
              setRecycleOpen(false);
              setToast(msg);
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>

      {/* Filters: what to show, then how to group it */}
      <section className="ticket-panel mt-6" aria-label="Binder filters">
        <div className="flex flex-wrap items-center gap-2 px-3 pt-3 sm:px-5">
          <input
            type="search"
            placeholder="Search player or team"
            aria-label="Search player or team"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 basis-48 rounded-full border border-line bg-bg-2 px-4 py-1.5 text-sm outline-none focus:border-accent"
          />
          <Select label="Set" value={setFilter} onChange={setSetFilter}>
            <option value="all">All sets</option>
            <option value="base">Base set</option>
            <option value="rookie">Rookies</option>
            {hasInserts && <option value="insert">All inserts</option>}
            {INSERT_TYPES.map((t) => (
              <option key={t} value={t}>
                {INSERT_NAMES[t]}
              </option>
            ))}
          </Select>
          <Select label="Team" value={team} onChange={setTeam}>
            <option value="all">All teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2 no-scrollbar overflow-x-auto px-3 py-3 sm:flex-wrap sm:overflow-visible sm:px-5">
          <Chip active={rarity === "all"} onClick={() => setRarity("all")}>Any rarity</Chip>
          {RARITIES.filter((r) => designs.some((d) => d.rarity === r)).map((r) => (
            <Chip key={r} active={rarity === r} onClick={() => setRarity(r)} color={RARITY_COLOR[r]}>
              {r}
            </Chip>
          ))}
        </div>
        <div className="perf" aria-hidden />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="field-label">Group by</span>
            <div role="radiogroup" aria-label="Group by" className="flex rounded-full border border-line p-0.5">
              {(
                [
                  ["set", "Set"],
                  ["team", "Team"],
                  ["rarity", "Rarity"],
                  ["none", "None"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={group === k}
                  onClick={() => setGroup(k)}
                  className={`rounded-full px-3 py-1 font-cond text-sm font-bold uppercase tracking-wider transition-colors ${
                    group === k ? "bg-text text-bg" : "text-muted hover:text-text"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Select label="Sort" value={sort} onChange={(v) => setSort(v as SortKey)}>
            <option value="rarity">Rarest first</option>
            <option value="ovr">Highest rated</option>
            <option value="newest">Newest pulls</option>
            <option value="name">Name A–Z</option>
          </Select>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Chip active={showMissing} onClick={() => setShowMissing((v) => !v)}>
              {showMissing ? "Missing shown" : "Missing hidden"}
            </Chip>
            <Chip active={dupesOnly} onClick={() => setDupesOnly((v) => !v)}>Duplicates</Chip>
            <Chip active={wishOnly} onClick={() => setWishOnly((v) => !v)} color="#ffd76a">
              Wishlist ({wishSet.size})
            </Chip>
          </div>
        </div>
      </section>

      <p className="mt-4 font-cond text-sm font-semibold text-muted" aria-live="polite">
        {shownCount} card{shownCount === 1 ? "" : "s"}
        {showMissing && !wishOnly ? " · cards you haven't pulled are blurred" : ""}
      </p>

      {/* Binder pages, one per group */}
      {shownCount === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-line px-4 py-10 text-center text-muted">
          {copies.length === 0 && !showMissing ? "Your binder is empty. Go open a pack!" : "No cards match these filters."}
        </p>
      ) : (
        groups.map((g) => (
          <section key={g.key} className="mt-8" aria-label={group === "none" ? "Cards" : groupTitle(group, g.key)}>
            {group !== "none" && <GroupHead group={group} k={g.key} owned={g.owned} total={g.total} />}
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {g.cards.map((d) => {
                const owned = byDesign.get(d.designId);
                const best = owned ? bestCopy(owned) : null;
                return (
                  <li key={d.designId} className="tb-binder__slot">
                    <button
                      type="button"
                      className={`relative block w-full cursor-pointer text-left ${owned ? "" : "tb-binder__missing"}`}
                      onClick={() => setOpen(d.designId)}
                      aria-label={`${d.players.map((p) => p.name).join(" & ")}${owned ? `, ${owned.length} owned` : ", not pulled yet"}`}
                    >
                      <Card
                        card={d}
                        missing={!owned}
                        tilt={!!owned}
                        finish={best?.finish}
                        serialNo={best?.serialNo}
                        supply={best?.supply}
                        grade={best?.grade}
                      />
                      {!owned && (
                        <span className="tb-binder__tag" aria-hidden>
                          Not pulled
                        </span>
                      )}
                      {owned && owned.length > 1 && (
                        <span className="absolute -right-1.5 -top-1.5 z-10 rounded-full bg-accent px-2 py-0.5 font-cond text-sm font-extrabold text-accent-ink shadow-lg">
                          ×{owned.length}
                        </span>
                      )}
                      {wishSet.has(d.designId) && (
                        <span
                          className="absolute -left-1.5 -top-1.5 z-10 rounded-full bg-[#ffd76a] px-2 py-0.5 font-cond text-sm font-extrabold text-bg shadow-lg"
                          aria-label="On your wishlist"
                        >
                          <StarIcon filled className="size-3.5" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      <AnimatePresence>
        {openDesign && (
          <CardDetail
            design={openDesign}
            copies={byDesign.get(openDesign.designId) ?? []}
            owners={owners[openDesign.designId] ?? []}
            wanters={wanters[openDesign.designId] ?? []}
            wished={wishSet.has(openDesign.designId)}
            onToggleWish={() => toggleWish(openDesign.designId)}
            showcase={showcaseList}
            locked={lockedSet}
            onToggleShowcase={toggleShowcase}
            onRecycle={recycleOne}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function recycleMessage(d: { recycled: number; gained: number; packsEarned: number }) {
  return `Recycled ${d.recycled} card${d.recycled === 1 ? "" : "s"} for ${d.gained} shards${
    d.packsEarned > 0 ? ` → +${d.packsEarned} bonus pack${d.packsEarned === 1 ? "" : "s"}!` : ""
  }`;
}

const RECYCLE_LEVELS: Rarity[] = ["common", "uncommon", "rare", "epic"];

function RecycleDialog({ onClose, onDone }: { onClose: () => void; onDone: (msg: string) => void }) {
  const [maxRarity, setMaxRarity] = useState<Rarity>("rare");
  const [plan, setPlan] = useState<{ cards: number; shards: number; current: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/recycle", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ extras: true, maxRarity, dryRun: true }),
    })
      .then((r) => r.json())
      .then((d) => live && setPlan(d));
    return () => {
      live = false;
    };
  }, [maxRarity]);

  async function go() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/recycle", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ extras: true, maxRarity }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Couldn't recycle");
    onDone(recycleMessage(data));
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const packs = plan ? Math.floor((plan.current + plan.shards) / SHARDS_PER_PACK) : 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#03050acc] px-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Recycle duplicates"
    >
      <motion.div
        className="w-full max-w-md rounded-md border border-line bg-panel p-6"
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-4xl leading-none">Recycle duplicates</h2>
        <p className="mt-2 text-sm text-muted">
          Keeps your best copy of every card and turns the spares into shards. {SHARDS_PER_PACK} shards = 1 bonus pack.
          Numbered cards, showcased cards and cards in open trades are never touched.
        </p>
        <div className="mt-5 font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">Recycle up to</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {RECYCLE_LEVELS.map((r) => (
            <Chip key={r} active={maxRarity === r} onClick={() => setMaxRarity(r)} color={RARITY_COLOR[r]}>
              {r}
            </Chip>
          ))}
        </div>
        <div className="mt-5 rounded-md bg-bg-2 px-4 py-3 font-cond">
          {plan ? (
            plan.cards === 0 ? (
              <span className="text-muted">No spare duplicates at this level.</span>
            ) : (
              <>
                <span className="font-display text-3xl text-accent">{plan.cards}</span> card{plan.cards === 1 ? "" : "s"} →{" "}
                <span className="font-bold"><ShardIcon className="mr-1 inline size-4 align-[-3px]" />{plan.shards} shards</span>
                {packs > 0 && <span className="text-accent"> = {packs} bonus pack{packs === 1 ? "" : "s"}</span>}
              </>
            )
          ) : (
            <span className="text-muted">Counting…</span>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy || !plan || plan.cards === 0} onClick={go}>
            {busy ? "Recycling…" : "Recycle"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardDetail({
  design,
  copies,
  owners,
  wanters,
  wished,
  onToggleWish,
  showcase,
  locked,
  onToggleShowcase,
  onRecycle,
  onClose,
}: {
  design: CardView;
  copies: OwnedCopy[];
  owners: string[];
  wanters: string[];
  wished: boolean;
  onToggleWish: () => void;
  showcase: string[];
  locked: Set<string>;
  onToggleShowcase: (id: string) => void;
  onRecycle: (id: string) => void;
  onClose: () => void;
}) {
  const sorted = useMemo(
    () => [...copies].sort((a, b) => FINISH_RANK[b.finish] - FINISH_RANK[a.finish] || b.grade - a.grade),
    [copies],
  );
  const [sel, setSel] = useState(sorted[0]?.instanceId);
  const copy = sorted.find((c) => c.instanceId === sel) ?? sorted[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#03050acc] px-4 py-10 backdrop-blur-md sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={design.players.map((p) => p.name).join(" & ")}
    >
      <motion.div
        className="flex w-full max-w-3xl flex-col items-center gap-8 sm:flex-row sm:items-start"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-64 shrink-0 sm:w-80">
          <TurnableCard
            card={design}
            finish={copy?.finish}
            serialNo={copy?.serialNo}
            supply={copy?.supply}
            grade={copy?.grade}
            missing={!copy}
            tilt={!!copy}
          />
        </div>
        <div className="w-full flex-1">
          <div className="font-cond text-sm font-bold uppercase tracking-[0.2em]" style={{ color: RARITY_COLOR[design.rarity] }}>
            {design.rarity} · {design.type}
          </div>
          <h2 className="font-display text-5xl leading-none">{design.players.map((p) => p.name).join(" & ")}</h2>
          {design.title && (
            <p className="mt-1 text-lg text-muted">
              {design.title}
              {design.year ? ` (${design.year})` : ""}
            </p>
          )}
          <p className="mt-1 font-cond text-muted">
            {design.players.map((p) => `${p.team} · ${p.pos} · ${p.nation}`).join("  /  ")}
          </p>

          <button
            type="button"
            onClick={onToggleWish}
            aria-pressed={wished}
            className={`btn mt-4 ${wished ? "bg-[#ffd76a] text-bg" : "btn-ghost"}`}
          >
            <StarIcon filled={wished} className="size-4" />{wished ? "On your wishlist" : "Add to wishlist"}
          </button>

          {owners.length > 0 && (
            <div className="mt-6">
              <h3 className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">Owned by</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {owners.map((u) => (
                  <Link
                    key={u}
                    href={`/trades/new?to=${encodeURIComponent(u)}&want=${encodeURIComponent(design.designId)}`}
                    className="rounded-full border border-line bg-panel px-3 py-1 font-cond text-sm font-bold hover:border-accent"
                  >
                    @{u} · Ask to trade →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {copy && wanters.length > 0 && (
            <div className="mt-6">
              <h3 className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">Wanted by</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {wanters.map((u) => (
                  <Link
                    key={u}
                    href={`/trades/new?to=${encodeURIComponent(u)}`}
                    className="rounded-full border border-[#ffd76a55] bg-panel px-3 py-1 font-cond text-sm font-bold text-[#ffd76a] hover:border-[#ffd76a]"
                  >
                    <StarIcon filled className="mr-1 inline size-3.5 align-[-2px]" />@{u} · Offer it →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {copies.length === 0 && owners.length === 0 && (
            <p className="mt-6 text-sm text-muted">Nobody has pulled this card yet.</p>
          )}

          {copies.length > 0 && (
          <h3 className="mt-6 font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Your copies ({copies.length})
          </h3>
          )}
          <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {sorted.map((c) => (
              <li key={c.instanceId}>
                <button
                  type="button"
                  onClick={() => setSel(c.instanceId)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left font-cond transition-colors ${
                    c.instanceId === copy?.instanceId ? "border-accent bg-panel-2" : "border-line bg-panel hover:bg-panel-2"
                  }`}
                >
                  <span className="font-bold capitalize">
                    {showcase.includes(c.instanceId) && <PinIcon className="mr-1.5 inline size-4 align-[-3px] text-accent" title="In your showcase" />}
                    {c.finish}
                    {c.serialNo && c.supply ? (
                      <span className="ml-2 text-[#ffd76a]">{c.supply === 1 ? "1/1" : `#${c.serialNo}/${c.supply}`}</span>
                    ) : null}
                  </span>
                  <span className="text-sm text-muted">
                    Grade {c.grade} · {new Date(c.pulledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {copy && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => onToggleShowcase(copy.instanceId)}>
                <PinIcon className="size-4" />{showcase.includes(copy.instanceId) ? "Remove from showcase" : "Pin to showcase"}
              </button>
              {(() => {
                const reason =
                  copies.length < 2
                    ? null // last copy: just hide the button
                    : NUMBERED_FINISHES.includes(copy.finish)
                      ? "Numbered cards can't be recycled"
                      : locked.has(copy.instanceId)
                        ? "In an open trade"
                        : showcase.includes(copy.instanceId)
                          ? "In your showcase"
                          : "";
                if (reason === null) return null;
                return (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={reason !== ""}
                    title={reason || undefined}
                    onClick={() => onRecycle(copy.instanceId)}
                  >
                    <RecycleIcon className="size-4" />Recycle copy (+{shardValueFor(design.rarity, copy.finish)} shards)
                  </button>
                );
              })()}
            </div>
          )}

          <button className="btn btn-ghost mt-6" onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
