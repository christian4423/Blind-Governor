import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands use completed", () => {
  it("add creates an incomplete todo and complete marks it completed", () => {
    const added = add([], "write tests");
    expect(added).toHaveLength(1);
    expect(added[0].completed).toBe(false);
    expect("done" in added[0]).toBe(false);
    const done = complete(added, added[0].id);
    expect(done[0].completed).toBe(true);
    expect("done" in done[0]).toBe(false);
  });
});
