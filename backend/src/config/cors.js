import { env } from "./env.js";
import { ApiError } from "../utils/ApiError.js";

export const corsOptions = {
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Request-ID", "X-Device-Fingerprint"],
  exposedHeaders: ["X-Request-ID", "RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new ApiError(403, "Origin is not allowed by CORS policy", "CORS_ORIGIN_DENIED"));
  },
};
