# Gate 7

Formerly TradeBall (repo, Vercel project and URL keep that name).

Free soccer & basketball card packs for you and your friends. See [PLAN.md](PLAN.md) for the full design.

## Live

**https://tradeball.vercel.app** — Vercel project `tradeball`, Neon Postgres in Sydney, functions in `syd1`.
Google sign-in keys and other settings live in the Vercel project's Environment Variables.

Redeploy after changes (the build runs `prisma migrate deploy` first):

```bash
npx vercel deploy --prod
```

## Run it locally

The app uses Postgres now, so local dev needs a database URL. The easiest: in Neon (Vercel → Storage →
your DB → Open in Neon) create a **dev branch**, and put its pooled and direct URLs in `.env` as
`DATABASE_URL` and `DATABASE_URL_UNPOOLED`. (Pointing at the production DB also works, but then local
testing changes your friends' real data.)

```bash
npm install
npx prisma migrate deploy
npm run dev              # http://localhost:3000
```

Copy `.env.example` to `.env` first and set `SESSION_SECRET` to any long random string.
Set `PACK_COOLDOWN_MINUTES=1` in `.env` to test packs quickly.
Sign-in is **Google only**. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (see `.env.example`). To keep the league private, leave the Google consent screen in *Testing* mode and add your friends as test users.

## Where things live

| Path | What |
|---|---|
| `src/lib/catalog/soccer.ts`, `basketball.ts` | Player list + special cards (moments, duos). Edit these to add players. |
| `src/lib/catalog/nfl.ts`, `scripts/nfl/` | Football base set: each team's starting 22 from the 2026 NFL depth charts (run `scripts/nfl/fetch.sh` then `node scripts/nfl/build.js`; `--trim` re-applies the pick without re-rating anyone kept; star ratings are pinned in `PINS`) |
| `src/lib/catalog/mlb.ts`, `scripts/mlb/` | Baseball base set: 18 per team (lineup, 5 starters, closer, 3 relievers), rated on 2026 WAR (`scripts/mlb/fetch.sh`, `node scripts/mlb/build.js`) |
| `src/lib/catalog/nhl.ts`, `scripts/nhl/` | Hockey base set: 16 per team (top 3 lines, 5 D, 2 G) from the 2026-27 lines (`scripts/nhl/fetch.sh`, `node scripts/nhl/build.js`) |
| `src/lib/catalog/lol.ts`, `scripts/lol/` | Esports set: every player of the 19 teams at the League of Legends 2026 World Championship (Play-In + Main Event), from Leaguepedia (`node scripts/lol/fetch.mjs`, then `node scripts/lol/build.mjs`; stars pinned in `PINS`, team colours fixable in `COLOR_FIX`) |
| `src/lib/catalog/champions.ts`, `scripts/champions/` | "The Champions" (Legendary insert, every sport): the players who contributed to each league's last title (Knicks, Seahawks, Brewers, Hurricanes, PSG, BLG). Thresholds are in `build.mjs`; Champions cards drop from every pack (2.5% per insert slot outside Hoops) |
| `src/lib/catalog/ucl.ts`, `scripts/ucl/` | Soccer base set: 2026-27 Champions League squads (generated; run `scripts/ucl/fetch.sh` then `node scripts/ucl/build.js`; star ratings are pinned in `PINS` in build.js) |
| `scripts/photos.mjs` (`npm run photos`) | Downloads NBA/NFL headshots and logos as small WebP files into `public/players` and `public/logos`, and makes binder-size thumbnails of the insert art; writes `src/lib/catalog/local-art.ts`. Re-run after rebuilding a player set or adding art. Cache lifetimes for these are in `next.config.ts`. |
| `src/lib/catalog/index.ts` | Turns players into card designs (rarity rules, stats) |
| `src/lib/odds.ts` | All odds: rarity, finishes, numbered supply, grades, pity |
| `src/lib/packs.ts` | Pack timer + server-side pack opening |
| `src/components/Card.tsx` | The card itself; styles in `src/app/globals.css` |
| `src/components/PackHub.tsx` | Pack shelf + opening animation |
| `src/components/CollectionView.tsx` | Binder, wishlist, who owns / wants a card |
| `src/lib/recycle.ts` | Duplicate recycling → shards → bonus packs |
| `src/lib/profile.ts` | Showcase, player stats, activity feed |
| `src/lib/trades.ts` | Trade rules: create, counter, accept (atomic swap), decline, cancel |
| `src/components/TradeBuilder.tsx`, `TradeCard.tsx` | Trade builder + offer cards |

## Status

- [x] Phase 0: app, DB (now Google sign-in + Postgres)
- [x] Phase 1: 275 players → 361 card designs, all rarity/finish styles
- [x] Phase 2: server-side packs, 4h timer, daily bonus, pity, opening animation
- [x] Phase 3 (basic): binder with completion, filters, card detail
- [x] Phase 4: trading (offers, counters, atomic swaps, auto-expiry, history, league log, wishlist)
- [x] Phase 5: league page + activity feed, profiles with 5-card showcase, duplicate recycling into shards (10 = 1 pack), Google sign-in, phone tab bar
- [x] Hosting: Vercel + Neon Postgres
