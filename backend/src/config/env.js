import "dotenv/config";
import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(5000),
  API_PREFIX: z.string().startsWith("/").default("/api/v1"),
  MONGODB_URL: z.string()
    .min(1)
    .regex(
      /^mongodb(?:\+srv)?:\/\/[^/]+\/?(?:\?.*)?$/,
      "MONGODB_URL must contain only the MongoDB server URL; configure the database separately with DB_NAME",
    )
    .default("mongodb://127.0.0.1:27017"),
  DB_NAME: z.string().regex(/^[A-Za-z0-9_-]+$/, "DB_NAME may only contain letters, numbers, underscores, and hyphens").default("Codex_realstate_db"),
  MONGODB_MIN_POOL_SIZE: z.coerce.number().int().min(0).max(100).default(2),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().max(200).default(20),
  MONGODB_MAX_IDLE_TIME_MS: z.coerce.number().int().positive().default(60000),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
  ACCESS_TOKEN_SECRET: z.string().min(32).default("development-access-token-secret-change-me"),
  REFRESH_TOKEN_SECRET: z.string().min(32).default("development-refresh-token-secret-change-me"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  REMEMBER_ME_TTL_DAYS: z.coerce.number().int().positive().default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: booleanFromString,
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  MAX_JSON_SIZE: z.string().default("1mb"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanFromString,
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default("EstateFlow <no-reply@example.com>"),
  SMTP_JSON_TRANSPORT: booleanFromString,
  EMAIL_VERIFICATION_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().min(3).default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().positive().default(15),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const details = result.error.issues.map(({ path, message }) => `${path.join(".")}: ${message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

if (result.data.NODE_ENV === "production") {
  const insecureSecrets = [
    result.data.ACCESS_TOKEN_SECRET,
    result.data.REFRESH_TOKEN_SECRET,
  ].some((secret) => secret.includes("development") || secret.includes("change-me"));

  if (insecureSecrets) {
    throw new Error("Production token secrets must be replaced with strong unique values");
  }
  if (!result.data.SMTP_HOST || !result.data.SMTP_USER || !result.data.SMTP_PASSWORD) {
    throw new Error("Production SMTP configuration is required");
  }
}
if (result.data.MONGODB_MIN_POOL_SIZE > result.data.MONGODB_MAX_POOL_SIZE) throw new Error("MONGODB_MIN_POOL_SIZE cannot exceed MONGODB_MAX_POOL_SIZE");

export const env = Object.freeze({
  ...result.data,
  corsOrigins: result.data.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
});
