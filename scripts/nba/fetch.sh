#!/usr/bin/env bash
# Downloads current NBA rosters (ESPN), last two seasons of per-game stats (ESPN),
# this year's college stats (ESPN) and the draft (Basketball-Reference) into data/.
# Then: node build.js && node emit.js  →  regenerates src/lib/catalog/nba.ts
# Edit the season numbers below when a new season starts (2026 = the 2025-26 season).
set -euo pipefail
cd "$(dirname "$0")"
D=data; mkdir -p "$D/rosters"
UA="Mozilla/5.0 (compatible; card-set-research/1.0)"
LAST=2026   # last completed NBA season (2025-26)
PREV=2025   # fallback season for players injured most of LAST
DRAFT=2026
api="https://site.web.api.espn.com/apis/common/v3/sports/basketball"
q="region=us&lang=en&contentorigin=espn&isqualified=false&limit=1000&sort=offensive.avgPoints%3Adesc&seasontype=2"
curl -s -A "$UA" -o "$D/teams.json" "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams"
for id in $(node -e 'const j=require("./data/teams.json");console.log(j.sports[0].leagues[0].teams.map(t=>t.team.id).join(" "))'); do
  curl -s -A "$UA" -o "$D/rosters/$id.json" "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/$id/roster"
done
curl -s -A "$UA" -o "$D/stats2026.json" "$api/nba/statistics/byathlete?$q&page=1&season=$LAST"
curl -s -A "$UA" -o "$D/stats2025.json" "$api/nba/statistics/byathlete?$q&page=1&season=$PREV"
for pg in 1 2 3; do
  curl -s -A "$UA" -o "$D/cbb2026_$pg.json" "$api/mens-college-basketball/statistics/byathlete?$q&page=$pg&season=$LAST"
done
curl -s -A "$UA" -o "$D/NBA_2026.html" "https://www.basketball-reference.com/draft/NBA_$DRAFT.html"
echo "done: $(ls $D/rosters | wc -l) rosters"
