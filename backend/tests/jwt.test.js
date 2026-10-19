import assert from "node:assert/strict";
import { describe, it } from "node:test";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env.js";
import { signAccessToken, verifyAccessToken } from "../src/utils/jwt.js";

describe("JWT helpers", () => {
  it("signs and verifies access-token claims", () => {
    const token = signAccessToken({ userId: "507f1f77bcf86cd799439011", sessionId: "session-1" });
    const payload = verifyAccessToken(token);
    assert.equal(payload.sub, "507f1f77bcf86cd799439011");
    assert.equal(payload.sid, "session-1");
    assert.equal(payload.type, "access");
  });
  it("reports expired access tokens with a refreshable code", () => {
    const token = jwt.sign({ sub: "507f1f77bcf86cd799439011", sid: "session-1", type: "access" }, env.ACCESS_TOKEN_SECRET, { expiresIn: -1, issuer: "estateflow-api", audience: "estateflow-web" });
    assert.throws(() => verifyAccessToken(token), (error) => error.code === "TOKEN_EXPIRED");
  });
});
