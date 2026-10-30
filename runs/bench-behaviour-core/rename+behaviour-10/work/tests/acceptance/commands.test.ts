import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands completed field", () => {
  it("add creates todo with completed false", () => {
    const t = add([], "buy milk");
    expect(t[0].completed).toBe(false);
    expect("done" in t[0]).toBe(false);
  });
  it("complete sets completed true", () => {
    const t = complete(add([], "walk dog"), 1);
    expect(t[0].completed).toBe(true);
    expect("done" in t[0]).toBe(false);
  });
});
