// [primary, secondary] colors per team. Unknown teams get a hashed color.
const TEAM_COLORS: Record<string, [string, string]> = {
  // Soccer
  "Real Madrid": ["#f4f1e8", "#c9a227"],
  Barcelona: ["#a50044", "#004d98"],
  "Atlético Madrid": ["#cb3524", "#272e61"],
  "Athletic Club": ["#ee2523", "#ffffff"],
  "Real Sociedad": ["#0067b1", "#ffffff"],
  Villarreal: ["#ffe667", "#005187"],
  "Man City": ["#6cabdd", "#1c2c5b"],
  "Man United": ["#da291c", "#fbe122"],
  Liverpool: ["#c8102e", "#00b2a9"],
  Arsenal: ["#ef0107", "#ffffff"],
  Chelsea: ["#034694", "#dba111"],
  Tottenham: ["#132257", "#ffffff"],
  Newcastle: ["#241f20", "#ffffff"],
  "Aston Villa": ["#670e36", "#95bfe5"],
  "West Ham": ["#7a263a", "#1bb1e7"],
  Everton: ["#003399", "#ffffff"],
  Brighton: ["#0057b8", "#ffffff"],
  Bournemouth: ["#da291c", "#000000"],
  Fulham: ["#ffffff", "#000000"],
  Leeds: ["#ffffff", "#1d428a"],
  Sunderland: ["#eb172b", "#ffffff"],
  "Bayern Munich": ["#dc052d", "#0066b2"],
  Dortmund: ["#fde100", "#000000"],
  PSG: ["#004170", "#da291c"],
  Inter: ["#0068a8", "#000000"],
  "AC Milan": ["#fb090b", "#000000"],
  Juventus: ["#000000", "#ffffff"],
  Napoli: ["#12a0d7", "#ffffff"],
  Atalanta: ["#1e71b8", "#000000"],
  Bologna: ["#1a2f48", "#a21c26"],
  Como: ["#0a3a7a", "#ffffff"],
  Galatasaray: ["#a90432", "#fdb912"],
  Fenerbahçe: ["#163962", "#ffed00"],
  Benfica: ["#e83030", "#ffffff"],
  Ajax: ["#d2122e", "#ffffff"],
  "Al Nassr": ["#fcd116", "#0033a0"],
  "Inter Miami": ["#f7b5cd", "#231f20"],
  LAFC: ["#000000", "#c39e6d"],
  "San Diego FC": ["#0a1e3c", "#f2f2f2"],
  Santos: ["#ffffff", "#000000"],
  Corinthians: ["#000000", "#ffffff"],
  León: ["#00703c", "#ffd100"],
  "Dynamo Moscow": ["#0047ab", "#ffffff"],
  // Basketball
  Nuggets: ["#0e2240", "#fec524"],
  Thunder: ["#007ac1", "#ef3b24"],
  Bucks: ["#00471b", "#eee1c6"],
  Lakers: ["#552583", "#fdb927"],
  Spurs: ["#000000", "#c4ced4"],
  Warriors: ["#1d428a", "#ffc72c"],
  Timberwolves: ["#0c2340", "#78be20"],
  Celtics: ["#007a33", "#ba9653"],
  Rockets: ["#ce1141", "#000000"],
  Cavaliers: ["#860038", "#fdbb30"],
  Knicks: ["#006bb6", "#f58426"],
  Mavericks: ["#00538c", "#b8c4ca"],
  "76ers": ["#006bb6", "#ed174c"],
  Suns: ["#1d1160", "#e56020"],
  Pistons: ["#c8102e", "#1d42ba"],
  Pacers: ["#002d62", "#fdbb30"],
  Clippers: ["#c8102e", "#1d428a"],
  Magic: ["#0077c0", "#000000"],
  Grizzlies: ["#5d76a9", "#12173f"],
  Hawks: ["#e03a3e", "#c1d32f"],
  Kings: ["#5a2d81", "#63727a"],
  Heat: ["#98002e", "#f9a01b"],
  "Trail Blazers": ["#e03a3e", "#000000"],
  Pelicans: ["#0c2340", "#c8102e"],
  Hornets: ["#1d1160", "#00788c"],
  Raptors: ["#ce1141", "#000000"],
  Jazz: ["#002b5c", "#f9a01b"],
  Bulls: ["#ce1141", "#000000"],
  Nets: ["#000000", "#ffffff"],
  Wizards: ["#002b5c", "#e31837"],
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function teamColors(team: string): [string, string] {
  const known = TEAM_COLORS[team];
  if (known) return known;
  const hue = hash(team) % 360;
  return [`hsl(${hue} 60% 40%)`, `hsl(${(hue + 40) % 360} 70% 70%)`];
}
