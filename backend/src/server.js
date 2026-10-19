import http from "node:http";
import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase, disconnectDatabase } from "./database/mongoose.js";
import { startNotificationReminderJob } from "./jobs/notificationReminderJob.js";

let server;
let shuttingDown = false;
let notificationJobTimer;

async function shutdown(signal, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (notificationJobTimer) clearInterval(notificationJobTimer);
  logger.info("Graceful shutdown started", { signal });

  const forceExit = setTimeout(() => {
    logger.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10000);
  forceExit.unref();

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDatabase();
  clearTimeout(forceExit);
  process.exit(exitCode);
}

async function start() {
  await connectDatabase();
  notificationJobTimer = startNotificationReminderJob();
  server = http.createServer(app);
  server.listen(env.PORT, () => logger.info("API server listening", { port: env.PORT, environment: env.NODE_ENV }));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  shutdown("uncaughtException", 1);
});
process.on("unhandledRejection", (error) => {
  logger.error("Unhandled rejection", { error });
  shutdown("unhandledRejection", 1);
});

start().catch(async (error) => {
  logger.error("API startup failed", { error, mongooseState: mongoose.connection.readyState });
  await disconnectDatabase();
  process.exit(1);
});
