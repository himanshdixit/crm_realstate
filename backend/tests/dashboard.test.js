import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dashboardHelpers } from "../src/services/dashboardService.js";

describe("dashboard service helpers", () => {
  it("fills missing revenue months with zero values", () => {
    const now = new Date();
    const rows = [{ _id: { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 }, amountMinor: 12500, payments: 2 }];
    const result = dashboardHelpers.fillMonths(rows, 6);
    assert.equal(result.length, 6);
    assert.equal(result.at(-1).amountMinor, 12500);
    assert.equal(result.at(-1).payments, 2);
    assert.equal(result.slice(0, -1).every((row) => row.amountMinor === 0), true);
  });
  it("limits customer-only identities to the customer dashboard audience", () => {
    const scope = dashboardHelpers.scopeFor({ _id: "customer-id", organization: null, roles: [{ slug: "customer" }] });
    assert.equal(scope.customer, true);
    assert.equal(scope.userId, "customer-id");
  });
  it("treats an internal role as internal even when multiple roles are assigned", () => {
    const scope = dashboardHelpers.scopeFor({ _id: "agent-id", organization: null, roles: [{ slug: "customer" }, { slug: "agent" }] });
    assert.equal(scope.customer, false);
  });

  it("recognizes only the super-admin role for administration data", () => {
    assert.equal(dashboardHelpers.isSuperAdmin({ roles: [{ slug: "super-admin" }] }), true);
    assert.equal(dashboardHelpers.isSuperAdmin({ roles: [{ slug: "admin" }] }), false);
    assert.equal(dashboardHelpers.isSuperAdmin({ roles: [] }), false);
  });

  it("builds safe normal-admin and effective-permission details", () => {
    const permissionId = "64b000000000000000000001";
    const roleId = "64b000000000000000000002";
    const result = dashboardHelpers.serializeAdministration({
      permissions: [{ _id: permissionId, key: "users.read", name: "Read users", resource: "users", action: "read", isActive: true }],
      roles: [{ _id: roleId, name: "Admin", slug: "admin", permissions: [permissionId], isSystem: true, isActive: true }],
      users: [{ _id: "64b000000000000000000003", firstName: "Normal", lastName: "Admin", email: "admin@example.test", roles: [roleId], directPermissions: [], deniedPermissions: [], status: "active", emailVerifiedAt: new Date(), passwordHash: "must-not-leak" }],
      statusCounts: [{ _id: "active", count: 1 }],
    });
    assert.equal(result.adminUsers.length, 1);
    assert.equal(result.users[0].effectivePermissions[0].key, "users.read");
    assert.equal("passwordHash" in result.users[0], false);
    assert.deepEqual(result.summary.byStatus, { active: 1 });
  });
});
