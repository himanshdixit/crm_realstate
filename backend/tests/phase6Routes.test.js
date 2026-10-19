import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";

describe("Phase 6 protected API contracts", () => {
  it("protects the lead pipeline", async () => {
    const response = await request(app).get("/api/v1/leads/pipeline");
    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(response.body.code, "AUTHENTICATION_REQUIRED");
  });
  it("protects PDF and Excel report exports", async () => {
    for (const format of ["pdf", "excel"]) {
      const response = await request(app).get(`/api/v1/reports/${format}?resource=properties`);
      assert.equal(response.status, 401);
      assert.equal(response.body.code, "AUTHENTICATION_REQUIRED");
    }
  });
  it("does not expose unregistered generic resources", async () => {
    const response = await request(app).get("/api/v1/secrets");
    assert.equal(response.status, 404);
    assert.equal(response.body.code, "ROUTE_NOT_FOUND");
  });
});
