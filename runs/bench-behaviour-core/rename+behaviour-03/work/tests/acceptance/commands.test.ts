import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands with completed", () => {
  it("add creates completed:false and complete sets completed:true", () => {
    const a = add([], "x");
    expect(a[0].completed).toBe(false);
    expect(a[0]).not.toHaveProperty("done");
    const c = complete(a, a[0].id);
    expect(c[0].completed).toBe(true);
    expect(c[0]).not.toHaveProperty("done");
  });
});
