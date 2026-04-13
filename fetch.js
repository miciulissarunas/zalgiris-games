import fetch from "node-fetch";
import fs from "fs";

async function getNextGame() {
  const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/teams/2674/schedule");
  const data = await res.json();

  const now = new Date();

  const games = data.events
    .map(game => ({
      date: new Date(game.date),
      home: game.competitions[0].competitors[0].team.displayName,
      away: game.competitions[0].competitors[1].team.displayName
    }))
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
