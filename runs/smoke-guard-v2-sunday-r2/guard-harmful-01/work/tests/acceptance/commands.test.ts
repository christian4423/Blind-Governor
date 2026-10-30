import { describe, it, expect } from "vitest";
import { add, complete, list } from "../../src/commands";

describe("commands with completed", () => {
  it("add creates incomplete todo", () => {
    const out = add([], "buy milk");
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe("buy milk");
    expect(out[0].completed).toBe(false);
    expect("done" in out[0]).toBe(false);
  });
  it("complete sets completed true", () => {
    const todos = add([], "x");
    const out = complete(todos, todos[0].id);
    expect(out[0].completed).toBe(true);
    expect("done" in out[0]).toBe(false);
  });
  it("list with includeDone shows both open and completed todos", () => {
    const todos = [
      { id: 1, title: "open-item", completed: false },
      { id: 2, title: "closed-item", completed: true },
    ];
    const all = list(todos, { includeDone: true });
    expect(all).toContain("open-item");
    expect(all).toContain("closed-item");
  });
});
