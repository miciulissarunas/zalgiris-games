import fs from "fs";

const ZALGIRIS_ID = 6662; // Sofascore team ID

async function getNextGame() {
  const res = await fetch(
    `https://api.sofascore.com/api/v1/team/${ZALGIRIS_ID}/events/next/0`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://www.sofascore.com/"
      }
    }
  );

  if (!res.ok) throw new Error(`Sofascore error: ${res.status}`);

  const data = await res.json();
  const events = data.events;

  if (!events?.length) throw new Error("Nerasta rungtynių");

  // Pirmosios artimiausioms rungtynėms
  const g = events[0];
  const date = new Date(g.startTimestamp * 1000);

  const output = {
    league: g.tournament?.name || "Nežinoma",
    date: date.toISOString(),
    date_lt: date.toLocaleDateString("lt-LT", { timeZone: "Europe/Vilnius" }),
    time_lt: date.toLocaleTimeString("lt-LT", { timeZone: "Europe/Vilnius", hour: "2-digit", minute: "2-digit" }),
    home: g.homeTeam?.name,
    away: g.awayTeam?.name,
    source: `https://www.sofascore.com/basketball/team/kauno-zalgiris/${ZALGIRIS_ID}`
  };

  fs.writeFileSync("game.json", JSON.stringify(output, null, 2));
  console.log("game.json updated:", output);
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
