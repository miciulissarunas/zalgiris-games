import fetch from "node-fetch";
import fs from "fs";

async function getNextGame() {
  const url = "https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/teams/2674/schedule";
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }

  const data = await res.json();

  console.log("Top-level keys:", Object.keys(data));

  const events = Array.isArray(data.events)
    ? data.events
    : Array.isArray(data?.team?.nextEvent)
    ? data.team.nextEvent
    : [];

  if (!events.length) {
    console.log("Full response:", JSON.stringify(data, null, 2));
    throw new Error("No events array found in API response");
  }

  const now = new Date();

  const games = events
    .map(game => {
      const comp = game?.competitions?.[0];
      const competitors = comp?.competitors || [];

      if (competitors.length < 2) return null;

      return {
        date: new Date(game.date),
        home: competitors[0]?.team?.displayName || "Unknown",
        away: competitors[1]?.team?.displayName || "Unknown"
      };
    })
    .filter(Boolean)
    .filter(game => game.date > now)
    .sort((a, b) => a.date - b.date);

  if (!games.length) {
    throw new Error("No upcoming games found");
  }

  const nextGame = games[0];

  const output = {
    home: nextGame.home,
    away: nextGame.away,
    date: nextGame.date.toISOString()
  };

  fs.writeFileSync("game.json", JSON.stringify(output, null, 2));
  console.log("game.json updated successfully");
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
