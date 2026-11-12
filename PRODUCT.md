# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A social circle of roughly 15–100 people (classmates, a club, a Discord-sized group) who follow soccer and basketball. They open the app in short bursts to rip their free packs when the timer refills, check what friends pulled, and haggle trades. Phone and desktop use are equally important; neither is the secondary layout.

## Product Purpose

A free trading-card collecting game for soccer and basketball. Players open free packs on a timer, build a binder toward full-set completion, and trade cards with each other. There are no game modes yet; collecting, chasing rare pulls, and trading are the whole product. Success is the group coming back every few hours to rip packs and actively trading with each other.

## Positioning

Card-collecting thrills without spending money: every pack is free, so rarity comes from time and luck, and status comes from what you pull and trade inside your own circle. The scarcest cards are numbered with a global supply (Gold /50, Black /10, Masterpiece 1/1), so a pull is unique within the league.

## Operating Context

- Ritual: a free pack every 4 hours (bank of 3), a daily bonus pack, and a pity guarantee of a Legendary or better within 40 packs.
- Pack opening is the emotional peak: tear the pack, cards come out face-down with a rarity glow, flip to reveal; big pulls get a full-screen moment.
- Social loop: a league page ranks players by set completion; an activity feed shows big pulls, trades, and new joiners; profiles show a pinned 5-card showcase.
- Trading: offer cards to a friend, accept, decline, or counter; swaps are atomic and conflicting offers expire.
- Sign-in is Google only; new players pick a public username.

## Capabilities and Constraints

- Two sports only: soccer and basketball. Series 1: 275 real players (current stars, rookies, all-time icons) → 361 card designs.
- Card layers: type (Base, Rookie, Star, Captain, Icon, Moment, Duo), rarity (Common, Uncommon, Rare, Epic, Legendary, Mythic), finish (Standard, Foil, Holo, Gold /50, Black /10, Masterpiece 1/1), condition grade 1–10 (10 = Gem Mint).
- Packs: Soccer, Hoops, Mixed; 6 cards; one guaranteed Rare-or-better slot.
- Duplicates recycle into shards (10 shards = 1 bonus pack); numbered, showcased, and in-trade cards can't be recycled.
- No player photos: card art is generated from team colors, initials, and sport markings. Player data and ratings are an editable snapshot.
- Stack: Next.js 16 (App Router), React 19, Tailwind 4, Motion, Prisma on Neon Postgres, deployed on Vercel (Sydney).
- Product name: Gate 7 (chosen in the Match Ticket revamp; formerly TradeBall). The repo, Vercel project and tradeball.vercel.app URL still carry the old name.

## Brand Commitments

- Fun, casual, made for friends; this is a hobby project, not a commercial product.
- Real player names, clubs, and famous moments are used as card subjects.
- Name: Gate 7, as in the turnstile gate printed on a match ticket.

## Evidence on Hand

- Real catalog data: src/lib/catalog/soccer.ts, src/lib/catalog/basketball.ts.
- No testimonials, user counts, press, or official league/club licensing. Never present the app as affiliated with any league, club, player, or existing card brand.

## Product Principles

1. The pull is the product: every pack must feel like an event, especially the rare ones.
2. Scarcity must be legible: rarity, finish, serial number, and grade should read at a glance.
3. Social proof over solitaire: what friends pulled and traded is as important as your own binder.
4. Free and fair: no pay-to-win; progress comes from time, luck, and trading.
5. Quick sessions: the core loop (rip, check, trade) must work in under a minute on a phone.
