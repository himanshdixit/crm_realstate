import winston from "winston";
import { env } from "./env.js";

const formats = [
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
];

formats.push(
  env.NODE_ENV === "production"
    ? winston.format.json()
    : winston.format.combine(winston.format.colorize(), winston.format.simple()),
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(...formats),
  defaultMeta: { service: "estateflow-api" },
  transports: [new winston.transports.Console()],
});
