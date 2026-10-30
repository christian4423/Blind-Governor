import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands with completed", () => {
  it("add creates incomplete todo", () => {
    const todos = add([], "buy milk");
    expect(todos).toHaveLength(1);
    expect(todos[0].completed).toBe(false);
    expect("done" in todos[0]).toBe(false);
  });
  it("complete sets completed true", () => {
    const todos = add([], "buy milk");
    const after = complete(todos, todos[0].id);
    expect(after[0].completed).toBe(true);
    expect("done" in after[0]).toBe(false);
  });
});
