import fs from "fs";
import { chromium } from "playwright";

async function getNextGame() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "lt-LT"
  });

  const page = await context.newPage();

  // Klausome network request'ų — ieškome API calls
  const apiResponses = [];
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("api") || url.includes("game") || url.includes("match") || url.includes("rungtynes") || url.includes("schedule")) {
      try {
        const json = await response.json();
        apiResponses.push({ url, json });
      } catch {}
    }
  });

  await page.goto("https://zalgiris.lt/rungtynes", {
    waitUntil: "networkidle",
    timeout: 60000
  });

  await page.waitForTimeout(5000);

  // Bandome ištraukti __NEXT_DATA__
  const nextData = await page.evaluate(() => {
    const el = document.getElementById("__NEXT_DATA__");
    return el ? el.textContent : null;
  });

  if (nextData) {
    fs.writeFileSync("debug.txt", nextData);
    console.log("NEXT_DATA found, length:", nextData.length);
    console.log("NEXT_DATA preview:\n", nextData.slice(0, 3000));
  } else {
    console.log("No __NEXT_DATA__ found");
  }

  // Loginame API response'us
  if (apiResponses.length > 0) {
    console.log("API calls found:");
    apiResponses.forEach(r => {
      console.log("URL:", r.url);
      console.log("JSON preview:", JSON.stringify(r.json).slice(0, 500));
    });
    fs.writeFileSync("api_responses.json", JSON.stringify(apiResponses, null, 2));
  } else {
    console.log("No API calls captured");
  }

  await browser.close();
  throw new Error("DEBUG STOP");
}

getNextGame().catch(err => {
  console.error(err.message);
  process.exit(1);
});
