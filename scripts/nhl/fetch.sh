#!/usr/bin/env bash
# Downloads the NHL from ESPN into data/: the 32 teams (with records), each team's roster (headshots)
# and depth chart (lines and pairs), and every player's stats for this season and last.
# Then: node build.js  →  regenerates src/lib/catalog/nhl.ts
# ESPN names a hockey season by the year it ends: 2027 = 2026-27.
set -euo pipefail
cd "$(dirname "$0")"
D=data; mkdir -p "$D/roster" "$D/depth" "$D/team"
UA="Mozilla/5.0 (compatible; card-set-research/1.0)"
SEASON=2027
PREV=2026
site="https://site.api.espn.com/apis/site/v2/sports/hockey/nhl"
stats="https://site.web.api.espn.com/apis/common/v3/sports/hockey/nhl/statistics/byathlete"

curl -s -A "$UA" -o "$D/teams.json" "$site/teams"
for id in $(node -e 'const j=require("./data/teams.json");console.log(j.sports[0].leagues[0].teams.map(t=>t.team.id).join(" "))'); do
  curl -s -A "$UA" -o "$D/team/$id.json" "$site/teams/$id"
  curl -s -A "$UA" -o "$D/roster/$id.json" "$site/teams/$id/roster"
  curl -s -A "$UA" -o "$D/depth/$id.json" "$site/teams/$id/depthcharts"
done
rm -f "$D"/stats*.json
for yr in $SEASON $PREV; do
  page=1
  while :; do
    curl -s -A "$UA" -o "$D/stats${yr}_$page.json" \
      "$stats?region=us&lang=en&contentorigin=espn&isqualified=false&limit=1000&season=$yr&seasontype=2&page=$page"
    pages=$(node -e 'console.log(require("./data/stats'"${yr}_$page"'.json").pagination?.pages ?? 1)')
    [ "$page" -ge "$pages" ] && break
    page=$((page + 1))
  done
done
echo "done: $(ls $D/roster | wc -l) teams"
