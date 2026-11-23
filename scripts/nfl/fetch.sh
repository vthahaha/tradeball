#!/usr/bin/env bash
# Downloads the 2026 NFL season (2026-27) from ESPN into data/: the 32 teams (with records),
# each team's roster (headshots) and depth chart, and every player's season stats so far.
# Then: node build.js  →  regenerates src/lib/catalog/nfl.ts
# Edit SEASON when a new season starts (ESPN names it by the year it starts).
set -euo pipefail
cd "$(dirname "$0")"
D=data; mkdir -p "$D/roster" "$D/depth" "$D/team"
UA="Mozilla/5.0 (compatible; card-set-research/1.0)"
SEASON=2026
site="https://site.api.espn.com/apis/site/v2/sports/football/nfl"
stats="https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete"

curl -s -A "$UA" -o "$D/teams.json" "$site/teams"
for id in $(node -e 'const j=require("./data/teams.json");console.log(j.sports[0].leagues[0].teams.map(t=>t.team.id).join(" "))'); do
  curl -s -A "$UA" -o "$D/team/$id.json" "$site/teams/$id"
  curl -s -A "$UA" -o "$D/roster/$id.json" "$site/teams/$id/roster"
  curl -s -A "$UA" -o "$D/depth/$id.json" "$site/teams/$id/depthcharts"
done

# Regular-season stats for every player, 1000 per page
page=1
while :; do
  curl -s -A "$UA" -o "$D/stats$page.json" \
    "$stats?region=us&lang=en&contentorigin=espn&isqualified=false&limit=1000&season=$SEASON&seasontype=2&page=$page"
  pages=$(node -e 'console.log(require("./data/stats'"$page"'.json").pagination?.pages ?? 1)')
  [ "$page" -ge "$pages" ] && break
  page=$((page + 1))
done
echo "done: $(ls $D/roster | wc -l) teams, $page stat pages"
