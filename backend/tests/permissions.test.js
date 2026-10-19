import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolvePermissionKeys } from "../src/helpers/permissionResolver.js";

describe("permission resolver", () => {
  it("merges active role and direct permissions while applying explicit denials", () => {
    const keys = resolvePermissionKeys({
      roles: [{ isActive: true, permissions: [{ key: "leads.read" }, { key: "leads.update" }] }],
      directPermissions: [{ key: "leads.assign" }],
      deniedPermissions: [{ key: "leads.update" }],
    });
    assert.deepEqual(new Set(keys), new Set(["leads.read", "leads.assign"]));
  });

  it("ignores inactive roles", () => {
    const keys = resolvePermissionKeys({
      roles: [{ isActive: false, permissions: [{ key: "users.delete" }] }],
      directPermissions: [],
      deniedPermissions: [],
    });
    assert.deepEqual(keys, []);
  });
});
