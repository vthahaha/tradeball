// Joins ESPN 2026-27 rosters with 2025-26 (fallback 2024-25) per-game stats and
// the 2026 draft, then picks 10 veterans per team + all first-round rookies.
const fs = require("fs");
const path = require("path");
// Raw downloads live in scripts/nba/data (gitignored); run fetch.sh first.
const D = path.join(__dirname, "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));

const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+(jr|sr|ii|iii|iv)$/, "")
    .replace(/[^a-z]/g, "");

function statsIndex(files) {
  const idx = new Map();
  const byName = new Map();
  for (const f of files) {
    const j = read(f);
    const names = Object.fromEntries(j.categories.map((c) => [c.name, c.names]));
    for (const a of j.athletes) {
      const v = {};
      for (const c of a.categories) {
        (names[c.name] || []).forEach((n, i) => (v[n] = Number(c.totals?.[i] ?? c.values?.[i])));
      }
      const s = {
        gp: v.gamesPlayed || 0,
        min: v.avgMinutes || 0,
        pts: v.avgPoints || 0,
        reb: v.avgRebounds || 0,
        ast: v.avgAssists || 0,
        stl: v.avgSteals || 0,
        blk: v.avgBlocks || 0,
        tov: v.avgTurnovers || 0,
        fg: v.fieldGoalPct || 0,
        tp: v.threePointFieldGoalPct || 0,
        team: a.athlete.teamShortName || a.athlete.teams?.[0]?.abbreviation,
      };
      idx.set(a.athlete.id, s);
      byName.set(norm(a.athlete.displayName), s);
    }
  }
  return { idx, byName };
}

const s26 = statsIndex(["stats2026.json"]);
const s25 = statsIndex(["stats2025.json"]);
const cbb = statsIndex(["cbb2026_1.json", "cbb2026_2.json", "cbb2026_3.json"]);

const impact = (s) => s.pts + 1.2 * s.reb + 1.5 * s.ast + 2 * s.stl + 2 * s.blk - s.tov;

// Draft 2026 from Basketball-Reference
const h = fs.readFileSync(path.join(D, "NBA_2026.html"), "utf8");
const cell = (row, stat) => {
  const m = row.match(new RegExp('data-stat="' + stat + '"[^>]*>(.*?)</t[dh]>', "s"));
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
};
const picks = [...h.matchAll(/<tr[^>]*>.*?<\/tr>/gs)]
  .map((m) => m[0])
  .filter((x) => x.includes('data-stat="pick_overall"'))
  .map((x) => ({ pick: Number(cell(x, "pick_overall")), name: cell(x, "player"), college: cell(x, "college_name") }))
  .filter((p) => p.pick && p.name);
const pickByName = new Map(picks.map((p) => [norm(p.name), p]));

// Teams + rosters
const teamsJ = read("teams.json").sports[0].leagues[0].teams.map((t) => t.team);
const out = { teams: [], players: [], rookies: [], review: [] };
for (const t of teamsJ) {
  const r = read(path.join("rosters", t.id + ".json"));
  out.teams.push({
    abbr: t.abbreviation,
    name: t.name, // e.g. "Celtics"
    full: t.displayName,
    color: "#" + (t.color || "333333"),
    alt: "#" + (t.alternateColor || "999999"),
  });
  const rows = r.athletes.map((a) => {
    const cur = s26.idx.get(a.id);
    const prev = s25.idx.get(a.id);
    let s = cur && cur.gp >= 25 ? cur : null;
    let src = "2025-26";
    if (!s && prev && prev.gp >= 25) {
      s = prev;
      src = "2024-25";
    }
    if (!s && cur && cur.gp >= 5) s = cur;
    const draft = pickByName.get(norm(a.displayName));
    const isRookie = (a.experience?.years ?? 0) === 0 && draft;
    return {
      id: a.id,
      name: a.displayName,
      team: t.abbreviation,
      pos: a.position?.abbreviation || "",
      jersey: a.jersey || "",
      country: a.birthPlace?.country || "",
      age: a.age,
      exp: a.experience?.years ?? 0,
      stats: s,
      statSrc: s ? src : null,
      score: s ? impact(s) : 0,
      draft,
      isRookie,
    };
  });
  const vets = rows.filter((x) => !x.isRookie).sort((a, b) => b.score - a.score);
  out.players.push(...vets.slice(0, 10));
  // review: someone outside the top 10 who played big minutes or has no stats but long experience
  for (const x of vets.slice(10)) {
    if (x.score >= 18 || (!x.stats && x.exp >= 4)) out.review.push(`${t.abbreviation} bench-cut: ${x.name} score=${x.score.toFixed(1)} exp=${x.exp} src=${x.statSrc}`);
  }
  for (const x of rows.filter((x) => x.isRookie && x.draft.pick <= 30)) {
    const c = cbb.byName.get(norm(x.name));
    out.rookies.push({ ...x, college: x.draft.college, cstats: c || null });
  }
}
// any first-round pick not found on a roster
const onRoster = new Set(out.rookies.map((r) => norm(r.name)));
for (const p of picks.filter((p) => p.pick <= 30)) if (!onRoster.has(norm(p.name))) out.review.push(`unsigned/unmatched R1 pick ${p.pick}: ${p.name}`);

fs.writeFileSync(path.join(__dirname, "selection.json"), JSON.stringify(out, null, 1));
console.log("teams", out.teams.length, "players", out.players.length, "rookies", out.rookies.length);
console.log("vets using 2024-25 fallback:", out.players.filter((p) => p.statSrc === "2024-25").map((p) => p.name).join(", "));
console.log("vets with NO stats:", out.players.filter((p) => !p.stats).map((p) => `${p.name} (${p.team})`).join(", "));
console.log("rookies without college stats:", out.rookies.filter((r) => !r.cstats).map((r) => `${r.draft.pick}.${r.name}`).join(", "));
console.log("REVIEW:\n" + out.review.join("\n"));
const top = [...out.players].sort((a, b) => b.score - a.score).slice(0, 15);
console.log("TOP 15:", top.map((p) => `${p.name} ${p.team} ${p.score.toFixed(1)}`).join(" | "));
