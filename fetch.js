import fs from "fs";

async function getNextGame() {
  const now = new Date();

  // Bandome du šaltinius
  const game = await tryEuroleague() || await tryTheSportsDB();
  if (!game) throw new Error("Nerasta rungtynių iš nė vieno šaltinio");

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
    .teams { font-size: 1.6rem; font-weight: bold; margin: 16px 0; line-height: 1.4; }
    .vs { color: #f0a500; display: block; font-size: 1rem; margin: 4px 0; }
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

async function tryEuroleague() {
  try {
    // Euroleague viešas XML feed
    const res = await fetch("https://feeds.incrowdsports.com/provider/euroleague-feeds/v2/competitions/E/seasons/E2025/clubs/ZAL/games/", {
      headers: { "Accept": "application/json, text/plain, */*" }
    });
    console.log("Euroleague status:", res.status);
    if (!res.ok) return null;

    const data = await res.json();
    const now = new Date();
    const upcoming = (data.data || [])
      .filter(g => new Date(g.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    if (!upcoming.length) return null;
    const g = upcoming[0];
    const d = new Date(g.startDate);
    return {
      league: "Eurolyga",
      date: d.toLocaleDateString("lt-LT", { timeZone: "Europe/Vilnius" }),
      time: d.toLocaleTimeString("lt-LT", { timeZone: "Europe/Vilnius", hour: "2-digit", minute: "2-digit" }),
      home: g.homeClub?.name || g.homeTeam?.name,
      away: g.awayClub?.name || g.awayTeam?.name,
    };
  } catch (e) {
    console.log("Euroleague klaida:", e.message);
    return null;
  }
}

async function tryTheSportsDB() {
  try {
    // Ieškom Žalgirio ID per pavadinimą
    const search = await fetch("https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=Zalgiris");
    const sData = await search.json();
    console.log("TheSportsDB teams:", sData.teams?.map(t => `${t.idTeam} ${t.strTeam} ${t.strSport}`));

    const team = sData.teams?.find(t =>
      t.strTeam.toLowerCase().includes("zalgiris") && t.strSport === "Basketball"
    );
    if (!team) return null;
    console.log("Rastas ID:", team.idTeam, team.strTeam);

    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${team.idTeam}`);
    const data = await res.json();
    if (!data.events?.length) return null;

    const g = data.events[0];
    return {
      league: g.strLeague,
      date: g.dateEvent,
      time: g.strTime?.slice(0, 5) ?? "TBD",
      home: g.strHomeTeam,
      away: g.strAwayTeam,
    };
  } catch (e) {
    console.log("TheSportsDB klaida:", e.message);
    return null;
  }
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
