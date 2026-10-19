import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { apiRateLimiter } from "./middlewares/rateLimiter.js";
import { rejectUnsafeInput } from "./middlewares/sanitize.js";
import { requestId } from "./middlewares/requestId.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(requestId);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors(corsOptions));
  app.use(express.json({ limit: env.MAX_JSON_SIZE }));
  app.use(express.urlencoded({ extended: false, limit: env.MAX_JSON_SIZE }));
  app.use(cookieParser());
  app.use(hpp());
  app.use(rejectUnsafeInput);
  app.use(compression());
  app.use(morgan(":method :url :status :response-time ms request-id=:req[x-request-id]", {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: () => env.NODE_ENV === "test",
  }));
  app.use(apiRateLimiter);
  app.use(apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
