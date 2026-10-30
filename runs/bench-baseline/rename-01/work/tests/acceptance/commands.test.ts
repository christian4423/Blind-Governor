import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands completed field", () => {
  it("add creates a todo with completed false and complete sets it true", () => {
    const added = add([], "buy milk");
    expect(added).toHaveLength(1);
    expect(added[0].completed).toBe(false);
    expect("done" in added[0]).toBe(false);
    const done = complete(added, added[0].id);
    expect(done[0].completed).toBe(true);
    expect("done" in done[0]).toBe(false);
  });
});
