#!/usr/bin/env bash
# Downloads MLB from ESPN into data/: the 30 teams, each team's roster (headshots) and depth chart,
# and every player's batting and pitching stats for the last completed season.
# Then: node build.js  →  regenerates src/lib/catalog/mlb.ts
# SEASON is the last completed season (in the offseason, rosters are already next year's).
set -euo pipefail
cd "$(dirname "$0")"
D=data; mkdir -p "$D/roster" "$D/depth"
UA="Mozilla/5.0 (compatible; card-set-research/1.0)"
SEASON=2026
site="https://site.api.espn.com/apis/site/v2/sports/baseball/mlb"
stats="https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/statistics/byathlete"

curl -s -A "$UA" -o "$D/teams.json" "$site/teams"
for id in $(node -e 'const j=require("./data/teams.json");console.log(j.sports[0].leagues[0].teams.map(t=>t.team.id).join(" "))'); do
  curl -s -A "$UA" -o "$D/roster/$id.json" "$site/teams/$id/roster"
  curl -s -A "$UA" -o "$D/depth/$id.json" "$site/teams/$id/depthcharts"
done
rm -f "$D"/batting*.json "$D"/pitching*.json
for cat in batting pitching; do
  page=1
  while :; do
    curl -s -A "$UA" -o "$D/$cat$page.json" \
      "$stats?region=us&lang=en&contentorigin=espn&isqualified=false&limit=1000&season=$SEASON&seasontype=2&category=$cat&page=$page"
    pages=$(node -e 'console.log(require("./data/'"$cat$page"'.json").pagination?.pages ?? 1)')
    [ "$page" -ge "$pages" ] && break
    page=$((page + 1))
  done
done
echo "done: $(ls $D/roster | wc -l) teams"
