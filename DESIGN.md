---
name: Gate 7
description: A free basketball trading-card game for a circle of friends, dressed as a match-night ticket.
colors:
  navy-950: "#0a1224"
  navy-900: "#0f1a33"
  navy-850: "#14213d"
  navy-800: "#1a2a4d"
  navy-700: "#233862"
  navy-600: "#31497a"
  navy-400: "#6b80ad"
  navy-300: "#a9b6d3"
  stock-soccer: "#ff7a45"
  stock-hoops: "#f2b33d"
  stock-mixed: "#2e7d5b"
  paper: "#f7f7f2"
  paper-2: "#e8e6dc"
  ink: "#14213d"
  ink-soft: "#4a5878"
  stamp: "#ff5a5f"
  stamp-ink: "#c62828"
  rarity-common: "#cfc9b8"
  rarity-uncommon: "#b9c6da"
  rarity-rare: "#4f8cff"
  rarity-epic: "#9a6cff"
  rarity-legendary: "#f2b33d"
  rarity-mythic: "#ff5fd2"
  rarity-grail: "#5cf2c8"
typography:
  display:
    fontFamily: "Anybody, sans-serif"
    fontWeight: 800
    fontVariation: "'wdth' 122"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    fontVariation: "'wdth' 82"
    letterSpacing: "0.14em"
  engrave:
    fontFamily: "Bodoni Moda, serif"
    fontWeight: 700
  signature:
    fontFamily: "Mr Dafoe, cursive"
    fontWeight: 400
  seal:
    fontFamily: "Noto Serif TC, Source Han Serif TC, Noto Serif CJK TC, Songti TC, PMingLiU, serif"
    fontWeight: 900
  machine-readable:
    fontFamily: "ui-monospace, Cascadia Mono, Consolas, Courier New, monospace"
    fontWeight: 600
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.stock-soccer}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.navy-950}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
---

# Design System: Gate 7

## Overview

**Creative North Star: "The Match Ticket"**

Gate 7 is named for the turnstile gate printed on a match ticket, and the app around the cards is that ticket at night: a floodlit navy ground, ticket stock in warm sport colours, white paper stubs, a red stamp for anything that needs attention. Perforations are the only divider. The UI is a frame for the cards and never competes with them.

The cards are the product. Every insert set is its own small world (a print technique, a material, a cultural reference) with full photo art, and each one has to read at thumbnail size in a binder and still reward a close look at full size. Scarcity is the point of a pull, so rarity, finish, serial number and grade must read at a glance on every card.

**Key characteristics:**
- Navy ground, paper and stamp red for the app; the colour lives in the cards.
- Condensed, uppercase, wide-tracked labels, as printed on a ticket (GATE · ROW · SEAT).
- Cards are physical objects: they tilt, glint and flip; the app shell stays still.
- One authored moment per card set, not a pile of effects.

## Colors

The app runs on one navy ramp with paper and stamp red; card colour comes from team colours, set palettes and the rarity ladder.

### Primary
- **Floodlit Navy** (#0f1a33 ground, #14213d panels, #31497a lines): every app surface. Darker is further back.
- **Ticket Stock Orange** (#ff7a45): the accent: primary buttons, focus outline, the active state.

### Neutral
- **Ticket Paper** (#f7f7f2): text on navy, paper stubs, light card stock.
- **Fog** (#a9b6d3): secondary text and field labels.
- **Ink** (#14213d): text on paper and on light surfaces.

### Rarity ladder
Common #cfc9b8 · Uncommon #b9c6da · Rare #4f8cff · Epic #9a6cff · Legendary #f2b33d · Mythic #ff5fd2 · Grail #5cf2c8. Rarity shows as the card's parallel border (`.tb-card[data-rarity]` sets `--frame` and `--rc`), never as a badge.

### Team colours
Each card gets `--t1`, `--t2` (its team), `--u1`, `--u2` (a second team, Rivalries) from `teamColors()`. They range from black to pale gold, so:
- **The Team Ink Rule.** Text on a team colour uses `var(--t1-ink)` / `var(--u1-ink)`, never a hard-coded white. Text written in a team colour on light stock uses `var(--t1-text)`, the team colour darkened to 4.5:1 on paper. Both are computed in `src/lib/color.ts`.

## Typography

**Display Font:** Anybody (variable width), for names, ratings and set titles.
**Body Font:** Archivo (variable width), for everything else; `.font-cond` narrows it for labels.
**Set fonts:** Bodoni Moda italic (engraved plates: Best of the Best, Founding Father) and Mr Dafoe (signatures: Hard Goodbyes). Noto Serif TC is loaded only for the twelve zodiac characters on Lunar New Year seals (a 12-glyph subset). The system monospace sets the two machine-readable lines on Passports cards.

**Character:** One variable family stretched wide for display and narrow for labels, so the whole app reads as one printed ticket.

### Hierarchy
- **Display** (800, width 122%, uppercase): page titles and the wordmark.
- **Card name** (900, width 66%, uppercase, sized by `nameSize()` in cqw): player names on cards.
- **Label** (700, 0.72rem, width 82%, 0.14em tracking, uppercase): field labels and small caps.

### Named Rules
**The Legibility Floor Rule.** Card text is sized in `cqw` and shrinks with the card. Fine print (card number, set line, team line) is hidden below 260px card width; the serial number never is, and is floored at 8px. Never ship card text that renders under ~6px at the size it is shown.

## Elevation

Flat app, physical cards. App surfaces separate by navy tone, not shadow. Cards carry real depth: a perspective tilt that follows the pointer, a glare layer, and drop shadows on stamped or pinned elements inside a set.

## Components

### Cards (the core component)
- **Shell:** `.tb-card`, 5:7, `container-type: inline-size`; everything inside is sized in `cqw`.
- **Frame:** the parallel border by rarity, 3cqw on inserts.
- **Front:** base cards render in `Card.tsx`; each insert set renders its own case in `InsertCard.tsx` and its own `.tb-ins--<set>` block in `globals.css`.
- **Back:** `CardReverse`, styled per set with `.tb-rev[data-set="<set>"]` (vars `--rev-bg`, `--rev-ink`, `--rev-mark`, `--rev-medal`, `--rev-rule` plus a `.tb-rev__deco` layer).
- **Small cards:** two container queries trim them: under 171px only the name, rating and the set's look remain; 171–259px drops the fine print except the serial.
- **Motion:** looping animations on a card pause when it scrolls off screen (`data-asleep`); every loop has a `prefers-reduced-motion` fallback.

### Ticket stock (panels)
Every app panel is cut from ticket stock, never a generic rounded box:
- **`.ticket-panel`:** a panel with punched notches on both sides at `--notch-y` (set it to the line where a header tears off, and put a `.perf` there).
- **`.ticket-list`:** on a `ul` inside a ticket panel; rows are split by perforations, not borders.
- **`.ticket-row`:** a single row with a tear-off stub on the left (`.ticket-row__stub`: a rank, a count), notched where the stub tears.
- Notches are a CSS mask, so anything drawn outside the edge is clipped: rings and focus on these use inset box-shadows.

### Buttons
Pill or 6px-radius, condensed uppercase label. Primary: orange stock on ink. Secondary: navy panel with a navy-600 line.

### Inputs
Navy-950 fill, navy-600 line, pill radius. Focus: border turns orange and the global dashed orange focus outline shows. Never remove the outline without drawing another.

## Do's and Don'ts

### Do:
- **Do** name every new insert element with a class nobody else uses (prefix with the set: `.tb-ins__rvplate`, `.tb-ins__zseal`), or scope it under the set (`.tb-ins--<set> .tb-ins__x`). `npm run check:css` runs before every build and fails on a clash.
- **Do** run `npm run art` after adding insert art. It fits images to 900 × 1260 and re-encodes them in place, keeping the name and format.
- **Do** leave the photo untouched on full-art sets. Colour goes in frames, edges and type, not casts over the art.
- **Do** keep each set to one authored idea and one loop at most.

### Don't:
- **Don't** write a bare `.tb-ins__x { }` rule for a class another set already owns. That is how Best of the Best and Generational broke.
- **Don't** put white text on a team colour, or team-colour text on paper, without the team ink variables.
- **Don't** wash full art in foil, colour-dodge or tints.
- **Don't** use emblems tied to militarism or hate movements as set decoration, even when a set's theme sits near them.
