#!/usr/bin/env bash
# Game logs for each 2025-26 team's top 4 scorers (for the Flamin' Hot insert).
set -euo pipefail
cd "$(dirname "$0")"
UA="Mozilla/5.0 (compatible; card-set-research/1.0)"
mkdir -p data/gamelogs
ids=$(node -e '
const s=require("./data/stats2026.json");const by={};
for(const a of s.athletes){const team=a.athlete.teamShortName||a.athlete.teams?.[0]?.abbreviation;const gp=Number(a.categories[0].totals[0]);const ppg=Number(a.categories[1].totals[0]);if(!team||gp<10)continue;(by[team]??=[]).push({id:a.athlete.id,ppg})}
console.log(Object.values(by).flatMap(l=>l.sort((x,y)=>y.ppg-x.ppg).slice(0,4).map(p=>p.id)).join(" "))')
n=0; for id in $ids; do
  [ -s "data/gamelogs/$id.json" ] || curl -s -A "$UA" -m 30 -o "data/gamelogs/$id.json" "https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/$id/gamelog?season=2026"
  n=$((n+1)); done
echo "gamelogs: $n"
