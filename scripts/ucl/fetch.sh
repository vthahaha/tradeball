#!/usr/bin/env bash
# Downloads the 2026-27 Champions League clubs and squads into data/:
#   UEFA: the league-phase clubs, every registered player (with the official headshot URL)
#         and the club coefficients (club strength).
#   ESPN: each club's UCL roster and domestic league roster, this season and last, for
#         appearances, goals and assists.
# Then: node build.js  →  regenerates src/lib/catalog/ucl.ts
# Edit the season numbers below when a new season starts.
set -euo pipefail
cd "$(dirname "$0")"
D=data; mkdir -p "$D/ucl" "$D/dom" "$D/prev" "$D/team"
UA="Mozilla/5.0 (compatible; card-set-research/1.0)"
UEFA_SEASON=2027 # UEFA names a season by the year it ends (2026/27)
ESPN_PREV=2025   # ESPN names it by the year it starts: 2025 = 2025-26
espn="https://site.api.espn.com/apis/site/v2/sports/soccer"
uefa="https://comp.uefa.com/v2"

curl -s -A "$UA" -o "$D/teams.json" "$espn/uefa.champions/teams"
curl -s -A "$UA" -o "$D/uefa-teams.json" "$uefa/teams?competitionId=1&seasonYear=$UEFA_SEASON&limit=100&offset=0"
curl -s -A "$UA" -o "$D/uefa-coeff.json" \
  "$uefa/coefficients?coefficientRange=OVERALL&coefficientType=MEN_CLUB&seasonYear=$UEFA_SEASON&page=1&pagesize=500&language=EN"

# Every player registered for the competition this season (paged, 500 at a time).
: >"$D/uefa-players.ndjson"
offset=0
while :; do
  curl -s -A "$UA" -o "$D/page.json" "$uefa/players?competitionId=1&seasonYear=$UEFA_SEASON&limit=500&offset=$offset"
  n=$(node -e 'const a=require("./data/page.json");if(!Array.isArray(a))process.exit(1);for(const p of a)console.log(JSON.stringify(p));' | tee -a "$D/uefa-players.ndjson" | wc -l)
  [ "$n" -lt 500 ] && break
  offset=$((offset + 500))
done
rm -f "$D/page.json"

for id in $(node -e 'const j=require("./data/teams.json");console.log(j.sports[0].leagues[0].teams.map(t=>t.team.id).join(" "))'); do
  curl -s -A "$UA" -o "$D/team/$id.json" "$espn/uefa.champions/teams/$id"
  curl -s -A "$UA" -o "$D/ucl/$id.json" "$espn/uefa.champions/teams/$id/roster"
  league=$(node -e 'const t=require("./data/team/'"$id"'.json").team;const h=(t.defaultLeague?.links||[]).map(l=>l.href).find(h=>/\/name\//.test(h))||"";console.log(h.split("/name/")[1]?.split("/")[0]||"")')
  if [ -n "$league" ]; then
    curl -s -A "$UA" -o "$D/dom/$id.json" "$espn/$league/teams/$id/roster"
    curl -s -A "$UA" -o "$D/prev/$id.json" "$espn/$league/teams/$id/roster?season=$ESPN_PREV"
  fi
  echo "$id $league"
done
echo "done: $(wc -l <"$D/uefa-players.ndjson") UEFA players, $(ls $D/ucl | wc -l) clubs"
