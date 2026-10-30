import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands with completed", () => {
  it("add creates open todo and complete marks it completed", () => {
    const a = add([], "x");
    expect(a[0].completed).toBe(false);
    const c = complete(a, a[0].id);
    expect(c[0].completed).toBe(true);
    expect((c[0] as any).done).toBeUndefined();
  });
});
