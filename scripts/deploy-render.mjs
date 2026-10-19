const { RENDER_API_KEY: apiKey, RENDER_SERVICE_ID: serviceId, RENDER_IMAGE_URL: imageUrl } = process.env;
if (!apiKey || !serviceId || !imageUrl) throw new Error("RENDER_API_KEY, RENDER_SERVICE_ID, and RENDER_IMAGE_URL are required");

const baseUrl = `https://api.render.com/v1/services/${encodeURIComponent(serviceId)}/deploys`;
const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json", "Content-Type": "application/json" };

const trigger = await fetch(baseUrl, {
  method: "POST",
  headers,
  body: JSON.stringify({ imageUrl }),
  signal: AbortSignal.timeout(30000),
});
if (!trigger.ok) throw new Error(`Render rejected deployment (${trigger.status}): ${(await trigger.text()).slice(0, 500)}`);
const deployment = await trigger.json();
if (!deployment.id) throw new Error("Render did not return a deployment identifier");

const failureStates = new Set(["build_failed", "update_failed", "pre_deploy_failed", "canceled", "deactivated"]);
const maximumAttempts = 90;
for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
  const response = await fetch(`${baseUrl}/${encodeURIComponent(deployment.id)}`, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Could not read Render deployment (${response.status})`);
  const current = await response.json();
  console.log(`Render deployment ${deployment.id}: ${current.status}`);
  if (current.status === "live") process.exit(0);
  if (failureStates.has(current.status)) throw new Error(`Render deployment failed with status: ${current.status}`);
  if (attempt < maximumAttempts) await new Promise((resolve) => setTimeout(resolve, 10000));
}

throw new Error(`Render deployment ${deployment.id} timed out`);
