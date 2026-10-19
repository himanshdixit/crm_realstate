import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useTable } from "@tanstack/react-table";

function CoreTableHarness() {
  const table = useTable({ data: [{ name: "Demo record" }], columns: [{ accessorKey: "name" }] });
  const cells = table.getRowModel().rows[0].getAllCells();
  return React.createElement("span", null, cells[0].getValue());
}

describe("TanStack core table rendering", () => {
  it("renders populated rows without optional visibility features", () => {
    assert.equal(renderToStaticMarkup(React.createElement(CoreTableHarness)), "<span>Demo record</span>");
  });
});
