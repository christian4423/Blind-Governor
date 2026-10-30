import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands use completed", () => {
  it("add creates uncompleted todo and complete marks it", () => {
    const t1 = add([], "buy milk");
    expect(t1).toHaveLength(1);
    expect(t1[0].completed).toBe(false);
    const t2 = complete(t1, t1[0].id);
    expect(t2[0].completed).toBe(true);
    expect((t2[0] as any).done).toBeUndefined();
  });
});
