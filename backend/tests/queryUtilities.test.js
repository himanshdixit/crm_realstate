import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePagination, paginationMeta } from "../src/utils/pagination.js";
import { buildSort, escapeRegExp } from "../src/utils/queryBuilder.js";

describe("query utilities", () => {
  it("bounds pagination input and calculates offsets", () => {
    assert.deepEqual(parsePagination({ page: "3", limit: "25" }), { page: 3, limit: 25, skip: 50 });
    assert.deepEqual(parsePagination({ page: "-2", limit: "9999" }), { page: 1, limit: 100, skip: 0 });
  });
  it("builds complete pagination metadata", () => {
    assert.deepEqual(paginationMeta({ page: 2, limit: 20, total: 45 }), { page: 2, limit: 20, total: 45, totalPages: 3, hasNextPage: true, hasPreviousPage: true });
  });
  it("only accepts allowlisted sort fields", () => {
    assert.deepEqual(buildSort("-status,title,$where", ["status", "title"]), { status: -1, title: 1, _id: -1 });
    assert.deepEqual(buildSort("passwordHash", ["title"]), { createdAt: -1, _id: -1 });
  });
  it("escapes regular expression metacharacters", () => {
    const escaped = escapeRegExp("villa.*(sale)");
    assert.equal(new RegExp(escaped).test("villa.*(sale)"), true);
    assert.equal(new RegExp(escaped).test("villa premium sale"), false);
  });
});
