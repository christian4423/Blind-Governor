import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands with completed", () => {
  it("add creates uncompleted todo", () => {
    const t = add([], "buy milk", "2026-11-01");
    expect(t[0].completed).toBe(false);
    expect("done" in t[0]).toBe(false);
  });
  it("complete sets completed", () => {
    const t = complete(add([], "walk dog"), 1);
    expect(t[0].completed).toBe(true);
    expect("done" in t[0]).toBe(false);
  });
});
