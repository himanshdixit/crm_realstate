const [url, attemptsValue = "30", delayValue = "10"] = process.argv.slice(2);
if (!url) throw new Error("Usage: node scripts/verify-deployment.mjs <url> [attempts] [delay-seconds]");

const attempts = Math.max(1, Number.parseInt(attemptsValue, 10) || 30);
const delayMs = Math.max(1, Number.parseInt(delayValue, 10) || 10) * 1000;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      console.log(`Healthy: ${url} (${response.status})`);
      process.exit(0);
    }
    console.warn(`Attempt ${attempt}/${attempts}: ${url} returned ${response.status}`);
  } catch (error) {
    console.warn(`Attempt ${attempt}/${attempts}: ${error.message}`);
  }
  if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
}

throw new Error(`Deployment did not become healthy: ${url}`);
