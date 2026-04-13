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
    waitUntil: "networkidle",
    timeout: 60000
  });

  await page.waitForTimeout(5000);

  const html = await page.content();
  await browser.close();

  fs.writeFileSync("debug.txt", html);

  const text = html.replace(/\s+/g, " ").trim();

  // Ieškome "Žalgiris" arba "Eurolyga" arba "LKL" konteksto
  const idx = text.search(/Eurolyga|Krepšinio Lyga|LKL|Žalgiris.*?-.*?\d{2}:\d{2}/);
  if (idx !== -1) {
    console.log("FOUND CONTEXT:\n", text.slice(Math.max(0, idx - 200), idx + 1000));
  } else {
    console.log("Nerasta Eurolyga/LKL tekste.");
    // Parodom vidurinę dalį HTML
    console.log("MIDDLE HTML:\n", text.slice(150000, 155000));
  }

  throw new Error("DEBUG STOP");
}

getNextGame().catch(err => {
  console.error(err.message);
  process.exit(1);
});
