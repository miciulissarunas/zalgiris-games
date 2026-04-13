import fs from "fs";

async function getNextGame() {
  const now = new Date();
  const season = "2025"; // 2025-2026 sezonas
  let nextGame = null;

  // Euroleague live.euroleague.net API - žinomas viešas endpoint
  // Einame per raundus ir ieškome artimiausioms rungtynėms su ZAL
  for (let round = 1; round <= 34; round++) {
    const url = `https://live.euroleague.net/api/Schedule?seasonCode=E${season}&gameNumber=${round}`;
    try {
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Origin": "https://www.euroleague.net",
          "Referer": "https://www.euroleague.net/"
        }
      });

      if (!res.ok) continue;

      const data = await res.json();
      const games = data?.items || data?.games || data?.Scoreboard || [];

      for (const g of games) {
        const isZAL = g.hometeam === "ZAL" || g.awayteam === "ZAL" ||
                      g.HomeTeamCode === "ZAL" || g.AwayTeamCode === "ZAL";
        if (!isZAL) continue;

        const gameDate = new Date(g.date || g.Date || g.GameDate);
        if (gameDate > now) {
          if (!nextGame || gameDate < new Date(nextGame.date || nextGame.Date)) {
            nextGame = g;
          }
        }
      }

      if (nextGame) break;

    } catch (e) {
      // tęsiame
    }
  }

  if (!nextGame) {
    // Debug: parodome ką grąžina pirmas raundas
    const url = `https://live.euroleague.net/api/Schedule?seasonCode=E${season}&gameNumber=1`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    console.log("Round 1 status:", res.status);
    if (res.ok) {
      const data = await res.json();
      fs.writeFileSync("debug.json", JSON.stringify(data, null, 2));
      console.log("Round 1 keys:", Object.keys(data));
      console.log("Preview:", JSON.stringify(data).slice(0, 1000));
    }
    throw new Error("Nerasta ZAL rungtynių");
  }

  const gameDate = new Date(nextGame.date || nextGame.Date || nextGame.GameDate);
  const output = {
    league: "Eurolyga",
    date: gameDate.toISOString(),
    date_lt: gameDate.toLocaleDateString("lt-LT", { timeZone: "Europe/Vilnius" }),
    time_lt: gameDate.toLocaleTimeString("lt-LT", { timeZone: "Europe/Vilnius", hour: "2-digit", minute: "2-digit" }),
    home: nextGame.hometeam || nextGame.HomeTeamName || nextGame.HomeTeamCode,
    away: nextGame.awayteam || nextGame.AwayTeamName || nextGame.AwayTeamCode,
    source: "live.euroleague.net"
  };

  fs.writeFileSync("game.json", JSON.stringify(output, null, 2));
  console.log("game.json updated:", output);
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
