import fs from "fs";

async function getNextGame() {
  // Bandome kelis endpoint'us
  const endpoints = [
    // Euroleague oficialus
    "https://api-live.euroleague.net/v1/games?seasonCode=E2025&teamCode=ZAL&limit=20",
    // Euroleague alternatyvus
    "https://feeds.incrowdsports.com/provider/euroleague-feeds/v2/competitions/E/seasons/E2025/teams/ZAL/games/?phaseTypeCode=RS&limit=5",
  ];

  for (const url of endpoints) {
    console.log("Trying:", url);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "application/json",
        }
      });
      console.log("Status:", res.status);
      if (res.ok) {
        const data = await res.json();
        fs.writeFileSync("debug.json", JSON.stringify(data, null, 2));
        console.log("SUCCESS! Keys:", Object.keys(data));
        console.log("Preview:", JSON.stringify(data).slice(0, 1000));
        return;
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  }

  throw new Error("Visi endpoint'ai nepavyko");
}

getNextGame().catch(err => {
  console.error(err);
  process.exit(1);
});
