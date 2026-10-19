import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classNames } from "../utils/classNames.js";

describe("classNames", () => {
  it("joins strings, arrays, and enabled object keys", () => {
    assert.equal(classNames("base", ["wide", null], { active: true, hidden: false }), "base wide active");
  });
  it("ignores unsupported and empty values", () => {
    assert.equal(classNames(null, false, undefined, 3, "ready"), "ready");
  });
});
