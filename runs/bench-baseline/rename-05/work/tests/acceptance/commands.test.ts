import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands completed field", () => {
  it("add creates incomplete todo", () => {
    const out = add([], "a");
    expect(out[0].completed).toBe(false);
    expect((out[0] as any).done).toBeUndefined();
  });
  it("complete sets completed", () => {
    const out = complete([{ id: 1, title: "a", completed: false }], 1);
    expect(out[0].completed).toBe(true);
    expect((out[0] as any).done).toBeUndefined();
  });
});
