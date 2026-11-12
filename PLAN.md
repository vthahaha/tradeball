# TradeBall — Project Plan

A web app for opening free soccer & basketball card packs and trading them with friends.
Small, private, built in shippable phases.

---

## 1. Core loop

**Open packs → reveal pulls → fill your binder → trade friends for what you're missing → repeat.**

Packs are free but limited per player — that scarcity is what gives cards and trades value.

- **1 free pack every 4 hours**, bank up to 3
- **Daily login bonus**: +1 pack
- **Pity timer**: guaranteed Legendary+ at least once every 40 packs

---

## 2. Cards

Each card combines three independent layers (plus an optional fourth).

### Layer A — Card type (what it is)
| Type | Description |
|---|---|
| **Base** | Standard player card |
| **Rookie** | Young / first-season players, special badge |
| **Star** | Current top players |
| **Icon** | Legends & retired greats (Pelé, Jordan, Zidane, Kobe…) |
| **Moment** | A famous play — match-winning goal, buzzer-beater |
| **Duo** | Two teammates or rivals on one card |
| **Captain** | Team captains |

### Layer B — Rarity tier (how hard to pull)
| Tier | Chance per card | Frame |
|---|---|---|
| Common | 60% | Plain |
| Uncommon | 25% | Silver edge |
| Rare | 10% | Blue glow |
| Epic | 4% | Purple glow |
| Legendary | 0.9% | Gold, animated |
| Mythic | 0.1% | Animated holo + particles |

### Layer C — Finish (extra roll on any card)
| Finish | Odds | Supply |
|---|---|---|
| Standard | Most cards | Unlimited |
| Foil | 1 in 8 | Unlimited |
| Holo | 1 in 30 | Unlimited |
| Gold | Rare | **Numbered /50** |
| Black | Very rare | **Numbered /10** |
| Masterpiece | Ultra rare | **1/1** — only one exists in the whole game |

Numbered cards have global supply tracking — the main bragging rights / trade driver.

### Layer D (optional) — Condition grade
Random 1–10 on pull, mostly 7–9. Grade 10 ("Gem Mint") ~3%. Can be deferred past v1.

### Card stats
- **Soccer:** PAC / SHO / PAS / DRI / DEF / PHY + overall
- **Basketball:** PTS / REB / AST / STL / BLK / 3PT + overall

Unused for now; ready for future game modes.

---

## 3. Packs

| Pack | Contents |
|---|---|
| **Soccer Pack** | 6 soccer cards, ≥1 Rare+ |
| **Hoops Pack** | 6 basketball cards, ≥1 Rare+ |
| **Mixed Pack** | 3 of each sport |
| **Event Pack** (later) | Themed, e.g. "World Cup Icons", "Playoffs" |

**Opening UX:** pack tears open → cards come out face-down → each card back glows its rarity color *before* the flip (suspense) → Mythic / 1/1 pulls get a full-screen moment.

**Rule:** all odds are rolled **server-side**. Never trust the browser.

---

## 4. Trading

- **Direct trades**: choose a friend, pick your cards + theirs, send an offer
- Recipient can **Accept / Decline / Counter**
- On accept, the server verifies both sides still own every card, then swaps everything in **one atomic DB transaction** (all or nothing — no dupes, no losses)
- **Public trade history**
- **Wishlist**: mark wanted cards; app shows which friends own them
- Later: **Trade Board** ("Looking for X, offering Y")

---

## 5. Collection & social

- **Binder view**: sport → league/team → set; completion %; grayed-out missing slots
- **Filters**: sport, team, rarity, finish, duplicates
- **Profile showcase**: pin your top 5 cards
- **Activity feed**: "X just pulled a Black /10 Messi 🔥"
- **Friend invites** via code — private group
- **Duplicates → pack shards**: 10 shards = 1 bonus pack

---

## 6. Tech stack

| Part | Choice | Why |
|---|---|---|
| Frontend | Next.js + React + TypeScript | Standard, easy deploy |
| Styling | Tailwind CSS | Card frames / foil / holo done in pure CSS — no art pipeline |
| Animation | Framer Motion | Card flips, pack opening |
| Backend / DB | Supabase (Postgres + Auth + Realtime) | Free tier, live trades & feed, DB functions for atomic trades and pack rolls |
| Login | Discord and/or Google via Supabase | No passwords to manage |
| Hosting | Vercel | Free, deploys on push |

All within free tiers for a friend group.

### Database tables
```
players          id, sport, name, team, position, nationality, stats(json), image_url
card_designs     id, player_id, set_id, type, rarity          -- template, e.g. "Epic Icon Zidane, Set 1"
card_instances   id, design_id, owner_id, finish, serial_no, grade, pulled_at   -- one owned copy
sets             id, name, sport, release_date
profiles         id, username, avatar, packs_available, last_pack_at, pity_counter, shards
trades           id, from_user, to_user, status, created_at, resolved_at
trade_items      trade_id, card_instance_id, side
wishlist         user_id, design_id
activity         id, user_id, kind, payload(json), created_at
```
**Design** = the template. **Instance** = a specific owned copy with its own finish, serial and grade. Trades move instances between owners.

---

## 7. Player data & images

- **Seed list**: ~150 soccer + ~150 basketball players in a JSON seed file (current stars, rookies, all-time Icons)
- **Images v1**: stylized — team colors, initials or silhouette, jersey number. Real photos can be added per player later.
- **Card design**: original TradeBall frames, one style per sport (not copying Match Attax / Topps layouts)

---

## 8. Build phases

| Phase | Ships | Result |
|---|---|---|
| **0. Setup** | Next.js app, Supabase project, login, deployed URL | Friends can sign in |
| **1. Cards** | Player seed data, card component with all rarity/finish styles | Gallery of all cards |
| **2. Packs** | Server-side rolls, cooldown timer, opening animation | **Pack opening works** |
| **3. Collection** | Binder, filters, completion %, card detail view | Something to show off |
| **4. Trading** | Offers, counters, atomic swap, history, wishlist | Core feature complete |
| **5. Social & polish** | Activity feed, profiles, showcase, shards, mobile layout | Ready for the group |
| **Later** | Game modes using card stats, limited sets, events, achievements | — |

**First milestone:** Phases 0–2.

---

## 9. Open decisions

- [ ] Real players or fictional? (default: real)
- [ ] Group size? (<20 → shrink /50 and /10 supplies)
- [ ] Login: Discord, Google, or both?
- [ ] Condition grades in v1 or later?
- [ ] Supabase + Vercel accounts OK, or start local-only?
