const required = ["NEXT_PUBLIC_API_URL"];
const errors = required.filter((key) => !process.env[key]).map((key) => `${key} is required`);
if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    const api = new URL(process.env.NEXT_PUBLIC_API_URL);
    if (api.protocol !== "https:") errors.push("NEXT_PUBLIC_API_URL must use HTTPS");
    if (!api.pathname.endsWith("/api/v1")) errors.push("NEXT_PUBLIC_API_URL must end with /api/v1");
  } catch { errors.push("NEXT_PUBLIC_API_URL must be a valid absolute URL"); }
}
if (errors.length) {
  errors.forEach((message) => console.error(`ERROR: ${message}`));
  process.exit(1);
}
console.log("Frontend production deployment configuration is valid");
