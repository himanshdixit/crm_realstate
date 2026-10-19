import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCurrencyMinor } from "../utils/formatCurrency.js";
import { formatLabel } from "../utils/formatLabel.js";

describe("dashboard formatters", () => {
  it("formats integer minor units as currency", () => {
    const value = formatCurrencyMinor(125050, "INR", "en-IN");
    assert.match(value, /1,251/);
  });
  it("turns machine labels into readable labels", () => {
    assert.equal(formatLabel("in-progress"), "In Progress");
  });
});
