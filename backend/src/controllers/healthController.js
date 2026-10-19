import { databaseHealth } from "../database/mongoose.js";
import { successResponse } from "../utils/ApiResponse.js";

const startedAt = Date.now();

export function liveness(_request, response) {
  response.json(successResponse({
    message: "API is running",
    data: {
      status: "up",
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    },
  }));
}

export function readiness(_request, response) {
  const database = databaseHealth();
  const ready = database.status === "up";
  response.status(ready ? 200 : 503).json({
    success: ready,
    message: ready ? "API is ready" : "API is not ready",
    data: { status: ready ? "ready" : "unavailable", database },
    errors: null,
  });
}
