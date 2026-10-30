import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands use completed", () => {
  it("add creates completed:false and complete sets completed:true", () => {
    const a = add([], "buy milk");
    expect(a).toHaveLength(1);
    expect(a[0].completed).toBe(false);
    expect("done" in a[0]).toBe(false);
    const c = complete(a, a[0].id);
    expect(c[0].completed).toBe(true);
    expect("done" in c[0]).toBe(false);
  });
});
