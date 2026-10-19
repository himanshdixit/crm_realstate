const [apiBase, frontendUrl] = process.argv.slice(2);
if (!apiBase || !frontendUrl) throw new Error("Usage: node scripts/production-smoke.mjs <api-base-url> <frontend-url>");

const api = apiBase.replace(/\/$/, "");
const frontend = frontendUrl.replace(/\/$/, "");
const checks = [];

async function check(name, action) {
  try { await action(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, error: error.message }); }
}

await check("API liveness", async () => {
  const response = await fetch(`${api}/health/live`, { signal: AbortSignal.timeout(10000) });
  const body = await response.json();
  if (!response.ok || body.success !== true || body.data?.status !== "up") throw new Error(`Unexpected response ${response.status}`);
  if (!response.headers.get("x-content-type-options")) throw new Error("Security headers are missing");
});
await check("API readiness", async () => {
  const response = await fetch(`${api}/health/ready`, { signal: AbortSignal.timeout(10000) });
  const body = await response.json();
  if (!response.ok || body.success !== true || body.data?.database?.status !== "up") throw new Error(`Database is not ready (${response.status})`);
});
await check("Credentialed CORS", async () => {
  const response = await fetch(`${api}/health/live`, { headers: { Origin: frontend }, signal: AbortSignal.timeout(10000) });
  if (response.headers.get("access-control-allow-origin") !== frontend) throw new Error("Production frontend origin is not allowed");
  if (response.headers.get("access-control-allow-credentials") !== "true") throw new Error("Credentialed CORS is disabled");
});
await check("Frontend availability", async () => {
  const response = await fetch(frontend, { redirect: "follow", signal: AbortSignal.timeout(10000) });
  const html = await response.text();
  if (!response.ok || !html.toLowerCase().includes("estateflow")) throw new Error(`Unexpected frontend response ${response.status}`);
  if (response.headers.get("x-content-type-options") !== "nosniff") throw new Error("Frontend security headers are missing");
});

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.error ? ` — ${result.error}` : ""}`);
if (checks.some(({ passed }) => !passed)) process.exit(1);
