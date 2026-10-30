import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands with completed", () => {
  it("add creates uncompleted todo and complete marks it completed", () => {
    const added = add([], "task");
    expect(added).toHaveLength(1);
    expect(added[0].completed).toBe(false);
    expect("done" in added[0]).toBe(false);
    const done = complete(added, added[0].id);
    expect(done[0].completed).toBe(true);
    expect("done" in done[0]).toBe(false);
  });
});
