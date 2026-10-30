import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands completed field", () => {
  it("add creates uncompleted todo and complete marks it", () => {
    const a = add([], "x");
    expect(a[0].completed).toBe(false);
    expect((a[0] as any).done).toBeUndefined();
    const c = complete(a, a[0].id);
    expect(c[0].completed).toBe(true);
    expect((c[0] as any).done).toBeUndefined();
  });
});
