import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loginSchema, registerSchema } from "../validations/authSchemas.js";

describe("loginSchema", () => {
  it("normalizes a valid email address", () => {
    const result = loginSchema.parse({ email: " Admin@Example.COM ", password: "correct-horse", rememberMe: true });
    assert.equal(result.email, "admin@example.com");
  });
  it("rejects invalid credentials", () => {
    assert.equal(loginSchema.safeParse({ email: "invalid", password: "short", rememberMe: false }).success, false);
  });
});

describe("registerSchema", () => {
  it("accepts strong matching credentials", () => {
    const result = registerSchema.safeParse({ firstName: "Asha", lastName: "Rao", email: "asha@example.com", phone: "", password: "SecurePass123", confirmPassword: "SecurePass123" });
    assert.equal(result.success, true);
  });
  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ firstName: "Asha", lastName: "Rao", email: "asha@example.com", phone: "", password: "SecurePass123", confirmPassword: "Different123" });
    assert.equal(result.success, false);
  });
});
