import fs from "fs";

async function getNextGame() {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Surask artimiausias BC Žalgiris Kaunas rungtynes (Eurolyga arba LKL). 
Grąžink TIK JSON tokiu formatu, nieko daugiau:
{"league":"...","date":"...","time":"...","home":"...","away":"..."}
Data formatas: YYYY-MM-DD, laikas: HH:MM (Vilniaus laiku).`
      }]
    })
  });

  const data = await response.json();
  
  // Surenkame tekstą iš visų content blokų
  const text = data.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");

  console.log("Claude response:", text);

  // Ištraukiame JSON
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("JSON nerasta atsakyme");
  
  const game = JSON.parse(match[0]);

  // Generuojame HTML
  const html = `<!DOCTYPE html>
<html lang="lt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="21600">
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
