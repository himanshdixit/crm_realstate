import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resourceRegistry } from "../src/config/resourceRegistry.js";
import { ALL_PERMISSION_KEYS } from "../src/constants/permissions.js";

describe("CRM resource registry", () => {
  it("registers every operational resource with explicit fields and search policy", () => {
    for (const [name, resource] of Object.entries(resourceRegistry)) {
      assert.ok(resource.model, `${name} requires a model`);
      assert.ok(resource.permission, `${name} requires a permission namespace`);
      assert.ok(resource.fields.length > 0, `${name} requires writable field allowlists`);
      assert.ok(Array.isArray(resource.searchFields));
    }
  });
  it("maps each resource to seeded read/create/update/delete permissions", () => {
    for (const resource of Object.values(resourceRegistry)) {
      for (const action of ["read", "create", "update", "delete"]) assert.ok(ALL_PERMISSION_KEYS.includes(`${resource.permission}.${action}`), `${resource.permission}.${action} must be seeded`);
    }
  });
  it("maps every soft-deletable resource to a restore permission", () => {
    for (const resource of Object.values(resourceRegistry)) assert.ok(ALL_PERMISSION_KEYS.includes(`${resource.permission}.restore`), `${resource.permission}.restore must be seeded`);
  });
});
