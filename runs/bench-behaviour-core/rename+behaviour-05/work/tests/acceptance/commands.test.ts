import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands completed", () => {
  it("add creates incomplete todo and complete sets completed", () => {
    const a = add([], "x");
    expect(a[0].completed).toBe(false);
    expect("done" in a[0]).toBe(false);
    const c = complete(a, a[0].id);
    expect(c[0].completed).toBe(true);
    expect("done" in c[0]).toBe(false);
  });
});
