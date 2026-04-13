import fs from "fs";
import cheerio from "cheerio";

async function getNextGame() {
  const res = await fetch("https://zalgiris.lt/rungtynes", {
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

  // Bandome ištraukti pirmą būsimos rungtynių bloką iš schedule teksto.
  // Pvz.:
  // Lietuvos Krepšinio Lyga AN, 04-14, 18:30 Telia Play Jonava - Žalgiris - Informacija
  const regex =
    /(Lietuvos Krepšinio Lyga|Eurolyga)\s+([A-ZŠTANPKR]{2},\s*\d{2}-\d{2},\s*\d{2}:\d{2})\s+.*?\s([A-Za-zÀ-ž0-9.\-'\s]+?)\s*-\s*([A-Za-zÀ-ž0-9.\-'\s]+?)\s*-\s*(Informacija|Bilietai)/;

  const match = text.match(regex);

  if (!match) {
    fs.writeFileSync("debug.txt", text);
    throw new Error("Nepavyko ištraukti rungtynių iš zalgiris.lt puslapio");
  }

  const league = match[1].trim();
  const dateText = match[2].trim();
  const home = match[3].trim();
  const away = match[4].trim();

  const output = {
    league,
    date_text: dateText,
    home,
    away,
    source: "https://zalgiris.lt/rungtynes"
  };

  fs.writeFileSync("game.json", JSON.stringify(output, null, 2));
  console.log("game.json updated successfully");
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
