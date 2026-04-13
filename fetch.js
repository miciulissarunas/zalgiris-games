import fs from "fs";

async function getNextGame() {
  // TheSportsDB - nemokamas, be API rakto
  const res = await fetch(
    "https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=134792",
    { headers: { "Accept": "application/json" } }
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const events = data.events;
  if (!events?.length) throw new Error("Rungtynių nerasta");

  const g = events[0];
  const dateStr = g.dateEvent; // YYYY-MM-DD
  const timeStr = g.strTime?.slice(0, 5) ?? "TBD"; // HH:MM

  const game = {
    league: g.strLeague,
    date: dateStr,
    time: timeStr,
    home: g.strHomeTeam,
    away: g.strAwayTeam,
  };

  const html = `<!DOCTYPE html>
<html lang="lt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Žalgiris – artimiausia rungtynės</title>
  <style>
    body { font-family: sans-serif; background: #1a1a2e; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
    .card { background: #16213e; border-radius: 16px; padding: 32px 48px; text-align: center; box-shadow: 0 4px 32px #0008; max-width: 400px; width: 100%; }
    .league { color: #f0a500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .teams { font-size: 1.6rem; font-weight: bold; margin: 16px 0; }
    .vs { color: #f0a500; margin: 0 12px; }
    .datetime { color: #aaa; font-size: 1rem; margin-top: 12px; }
    .updated { color: #555; font-size: 0.75rem; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="league">${game.league}</div>
    <div class="teams">
      <span>${game.home}</span>
      <span class="vs">vs</span>
      <span>${game.away}</span>
    </div>
    <div class="datetime">📅 ${game.date} &nbsp; 🕐 ${game.time}</div>
    <div class="updated">Atnaujinta: ${new Date().toLocaleString("lt-LT", { timeZone: "Europe/Vilnius" })}</div>
  </div>
</body>
</html>`;

  fs.writeFileSync("game.html", html);
  fs.writeFileSync("game.json", JSON.stringify(game, null, 2));
  console.log("Išsaugota:", game);
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
