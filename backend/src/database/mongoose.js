import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

mongoose.set("strictQuery", true);

export async function connectDatabase() {
  mongoose.connection.on("error", (error) => logger.error("MongoDB connection error", { error }));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

  await mongoose.connect(env.MONGODB_URL, {
    dbName: env.DB_NAME,
    autoIndex: env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 10000,
    minPoolSize: env.MONGODB_MIN_POOL_SIZE,
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    maxIdleTimeMS: env.MONGODB_MAX_IDLE_TIME_MS,
  });

  logger.info("MongoDB connected", { host: mongoose.connection.host, database: mongoose.connection.name });
  return mongoose.connection;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export function databaseHealth() {
  const state = mongoose.connection.readyState;
  return {
    status: state === 1 ? "up" : "down",
    state,
  };
}
