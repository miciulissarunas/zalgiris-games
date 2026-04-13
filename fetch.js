import fs from "fs";

async function getNextGame() {
  // Euroleague oficialus API - viešas, nereikia auth
  const res = await fetch(
    "https://api-live.euroleague.net/v1/games?seasonCode=E2025&teamCode=ZAL&limit=20",
    {
      headers: {
        "Accept": "application/json",
        "Origin": "https://www.euroleague.net"
      }
    }
  );

  if (!res.ok) {
    // Backup: bandome LKL API
    return await getLKLGame();
  }

  const data = await res.json();
  const now = new Date();

  // Randame artimiausias neįvykusias rungtynes
  const upcoming = data.data
    ?.filter(g => new Date(g.date) > now)
    ?.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!upcoming?.length) {
    throw new Error("Nerasta artimiausiom rungtynėm Euroleague");
  }

  const g = upcoming[0];
  const output = {
    league: "Eurolyga",
    date: g.date,
    home: g.homeTeam?.name,
    away: g.awayTeam?.name,
    venue: g.venue,
    source: "euroleague.net"
  };

  fs.writeFileSync("game.json", JSON.stringify(output, null, 2));
  console.log("game.json updated:", output);
}

async function getLKLGame() {
  // LKL API backup
  const res = await fetch("https://www.lkl.lt/api/schedule?team=zalgiris&limit=5", {
    headers: { "Accept": "application/json" }
  });

  if (!res.ok) throw new Error(`LKL API error: ${res.status}`);
  const data = await res.json();
  fs.writeFileSync("debug_lkl.json", JSON.stringify(data, null, 2));
  console.log("LKL data:", JSON.stringify(data).slice(0, 500));
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
