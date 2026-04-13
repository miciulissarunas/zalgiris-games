import fs from "fs";
import { chromium } from "playwright";

async function getNextGame() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "lt-LT"
  });

  const page = await context.newPage();
  await page.goto("https://zalgiris.lt/rungtynes", {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });

  const html = await page.content();
  await browser.close();

  const text = html.replace(/\s+/g, " ").trim();

  const regex = /(Lietuvos Krepšinio Lyga|Eurolyga)\s+(AN|PN|SK|TR|KT|ŠT),\s*(\d{2}-\d{2}),\s*(\d{2}:\d{2})\s+.*?\s([A-Za-zÀ-ž0-9ŠšŽžŪūĖėĄąČčĘęĮįŲų&.' -]+?)\s*-\s*([A-Za-zÀ-ž0-9ŠšŽžŪūĖėĄąČčĘęĮįŲų&.' -]+?)\s*-\s*(Informacija|Bilietai)/;
  const match = text.match(regex);

  if (!match) {
    fs.writeFileSync("debug.txt", text);
    throw new Error("Nepavyko ištraukti artimiausių rungtynių iš zalgiris.lt");
  }

  const output = {
    league: match[1].trim(),
    date_text: match[3].trim(),
    time_text: match[4].trim(),
    home: match[5].trim(),
    away: match[6].trim(),
    source: "https://zalgiris.lt/rungtynes"
  };

  fs.writeFileSync("game.json", JSON.stringify(output, null, 2));
  console.log("game.json updated successfully");
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
