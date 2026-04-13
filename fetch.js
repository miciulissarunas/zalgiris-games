import fs from "fs";

async function getNextGame() {
  const res = await fetch("https://site.web.api.espn.com/apis/v2/sports/basketball/leagues/euroleague/events");

  const data = await res.json();

  const now = new Date();

  const games = data.events
    .filter(g =>
      g.competitions?.[0]?.competitors?.some(c =>
        c.team?.displayName.toLowerCase().includes("zalgiris")
      )
    )
    .map(game => {
      const comp = game.competitions[0];
      const teams = comp.competitors;

      return {
        date: new Date(game.date),
        home: teams[0].team.displayName,
        away: teams[1].team.displayName
      };
    })
    .filter(g => g.date > now)
    .sort((a, b) => a.date - b.date);

  if (!games.length) throw new Error("No upcoming games");

  const nextGame = games[0];

  fs.writeFileSync("game.json", JSON.stringify({
    home: nextGame.home,
    away: nextGame.away,
    date: nextGame.date.toISOString()
  }, null, 2));

  console.log("game.json updated");
}

getNextGame().catch(e => {
  console.error(e);
  process.exit(1);
});
