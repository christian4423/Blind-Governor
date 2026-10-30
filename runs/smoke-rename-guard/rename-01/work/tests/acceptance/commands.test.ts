import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands use completed", () => {
  it("add creates uncompleted todo and complete marks it", () => {
    const a = add([], "task");
    expect(a[0].completed).toBe(false);
    expect("done" in a[0]).toBe(false);
    const b = complete(a, a[0].id);
    expect(b[0].completed).toBe(true);
    expect("done" in b[0]).toBe(false);
  });
});
