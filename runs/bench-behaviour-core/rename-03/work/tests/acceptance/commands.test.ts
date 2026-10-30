import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands with completed", () => {
  it("add creates incomplete todos and complete marks them completed", () => {
    const a = add([], "task");
    expect(a).toHaveLength(1);
    expect(a[0].completed).toBe(false);
    expect("done" in a[0]).toBe(false);
    const c = complete(a, a[0].id);
    expect(c[0].completed).toBe(true);
    expect("done" in c[0]).toBe(false);
  });
});
