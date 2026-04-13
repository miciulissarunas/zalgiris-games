import fs from "fs";
import * as cheerio from "cheerio";

async function getNextGame() {
  const res = await fetch("https://zalgiris.lt/en/schedule", {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const text = $("body").text().replace(/\s+/g, " ").trim();

  const regex = /(EuroLeague|Betsafe-LKL|Citadele KMT|King Mindaugas Cup|Lietuvos Krepšinio Lyga).*?(\d{2}-\d{2}).*?(\d{2}:\d{2}).*?([A-Za-zÀ-ž0-9&.\-'\s]+?)\s*-\s*([A-Za-zÀ-ž0-9&.\-'\s]+?)(?:\s|$)/i;

  const match = text.match(regex);

  if (!match) {
    fs.writeFileSync("debug.txt", text);
    throw new Error("Nepavyko ištraukti rungtynių iš zalgiris.lt");
  }

  const output = {
    league: match[1].trim(),
    date_text: match[2].trim(),
    time_text: match[3].trim(),
    home: match[4].trim(),
    away: match[5].trim(),
    source: "https://zalgiris.lt/en/schedule"
  };

  fs.writeFileSync("game.json", JSON.stringify(output, null, 2));
  console.log("game.json updated successfully");
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
