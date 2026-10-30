import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands use completed", () => {
  it("add creates an uncompleted todo and complete marks it completed", () => {
    const added = add([], "task");
    expect(added).toHaveLength(1);
    expect(added[0].completed).toBe(false);
    expect((added[0] as any).done).toBeUndefined();
    const done = complete(added, added[0].id);
    expect(done[0].completed).toBe(true);
    expect((done[0] as any).done).toBeUndefined();
  });
});
