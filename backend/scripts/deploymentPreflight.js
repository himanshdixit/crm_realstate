import { env } from "../src/config/env.js";

const errors = [];
const warnings = [];
const isHttps = (value) => { try { return new URL(value).protocol === "https:"; } catch { return false; } };

if (env.NODE_ENV !== "production") errors.push("NODE_ENV must be production");
if (!env.COOKIE_SECURE) errors.push("COOKIE_SECURE must be true");
if (env.COOKIE_SAME_SITE === "none" && !env.COOKIE_SECURE) errors.push("SameSite=None requires secure cookies");
if (!isHttps(env.FRONTEND_URL)) errors.push("FRONTEND_URL must use HTTPS");
for (const origin of env.corsOrigins) if (!isHttps(origin)) errors.push(`CORS origin must use HTTPS: ${origin}`);
if (env.corsOrigins.includes("*")) errors.push("Wildcard CORS is not permitted with credentialed authentication");
if (env.TRUST_PROXY < 1) warnings.push("TRUST_PROXY is 0; verify this is intentional behind the hosting proxy");
if (!env.MONGODB_URL.startsWith("mongodb+srv://") && !/[?&]tls=true(?:&|$)/.test(env.MONGODB_URL)) warnings.push("MongoDB URL is not SRV-based and does not explicitly enable TLS");
if (env.ACCESS_TOKEN_SECRET === env.REFRESH_TOKEN_SECRET) errors.push("Access and refresh token secrets must be different");
if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) errors.push("SMTP configuration is required");

warnings.forEach((message) => console.warn(`WARNING: ${message}`));
if (errors.length) {
  errors.forEach((message) => console.error(`ERROR: ${message}`));
  process.exit(1);
}
process.stdout.write("Backend production deployment configuration is valid\n");
