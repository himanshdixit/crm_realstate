import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("authentication API contract", () => {
  const app = createApp();
  it("validates registration before database access", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({ email: "invalid" }).expect(422);
    assert.equal(response.body.code, "VALIDATION_ERROR");
    assert.equal(response.body.success, false);
  });
  it("validates login credentials before database access", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({ email: "invalid", password: "" }).expect(422);
    assert.equal(response.body.code, "VALIDATION_ERROR");
  });
  it("requires a refresh cookie", async () => {
    const response = await request(app).post("/api/v1/auth/refresh").expect(401);
    assert.equal(response.body.code, "REFRESH_TOKEN_REQUIRED");
  });
  it("protects authenticated account endpoints", async () => {
    const response = await request(app).get("/api/v1/auth/me").expect(401);
    assert.equal(response.body.code, "AUTHENTICATION_REQUIRED");
  });
  it("protects Super Admin user-management endpoints", async () => {
    const response = await request(app).post("/api/v1/dashboard/users").send({}).expect(401);
    assert.equal(response.body.code, "AUTHENTICATION_REQUIRED");
  });
  it("protects global search", async () => {
    const response = await request(app).get("/api/v1/search?q=house").expect(401);
    assert.equal(response.body.code, "AUTHENTICATION_REQUIRED");
  });
  it("protects the personal notification inbox", async () => {
    const response = await request(app).get("/api/v1/notifications/inbox").expect(401);
    assert.equal(response.body.code, "AUTHENTICATION_REQUIRED");
  });
});
