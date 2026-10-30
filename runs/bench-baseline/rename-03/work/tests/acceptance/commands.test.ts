import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands completed rename", () => {
  it("add creates a todo with completed false", () => {
    const out = add([], "x") as any[];
    expect(out).toHaveLength(1);
    expect(out[0].completed).toBe(false);
    expect("done" in out[0]).toBe(false);
  });
  it("complete sets completed true", () => {
    const start = add([], "x");
    const out = complete(start, start[0].id) as any[];
    expect(out[0].completed).toBe(true);
    expect("done" in out[0]).toBe(false);
  });
});
