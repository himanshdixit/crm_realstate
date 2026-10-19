import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

const handler = (request, response) => {
  response.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
    data: null,
    errors: null,
    code: "RATE_LIMIT_EXCEEDED",
    requestId: request.id,
  });
};

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler,
});

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler,
});
