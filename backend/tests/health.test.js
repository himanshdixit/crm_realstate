import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("health API", () => {
  const app = createApp();

  it("returns liveness status using the standard response contract", async () => {
    const response = await request(app).get("/api/v1/health/live").expect(200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, "up");
    assert.equal(response.body.errors, null);
    assert.ok(response.headers["x-request-id"]);
  });

  it("returns a normalized 404 response", async () => {
    const response = await request(app).get("/api/v1/does-not-exist").expect(404);
    assert.equal(response.body.success, false);
    assert.equal(response.body.code, "ROUTE_NOT_FOUND");
    assert.ok(response.body.requestId);
  });

  it("rejects unsafe MongoDB operator keys", async () => {
    const response = await request(app)
      .post("/api/v1/health/live")
      .send({ $where: "malicious" })
      .expect(400);
    assert.equal(response.body.code, "UNSAFE_INPUT");
  });

  it("allows the frontend device header during CORS preflight", async () => {
    const response = await request(app)
      .options("/api/v1/auth/register")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type,x-device-fingerprint")
      .expect(204);
    assert.match(response.headers["access-control-allow-headers"], /X-Device-Fingerprint/i);
    assert.equal(response.headers["access-control-allow-origin"], "http://localhost:3000");
  });
});
