import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands use Todo.completed", () => {
  it("add creates an uncompleted todo", () => {
    const todos = add([], "buy milk");
    expect(todos).toHaveLength(1);
    expect(todos[0].completed).toBe(false);
    expect("done" in todos[0]).toBe(false);
  });
  it("complete marks the todo completed", () => {
    const todos = complete(add([], "buy milk"), add([], "buy milk")[0].id);
    expect(todos[0].completed).toBe(true);
    expect("done" in todos[0]).toBe(false);
  });
});
