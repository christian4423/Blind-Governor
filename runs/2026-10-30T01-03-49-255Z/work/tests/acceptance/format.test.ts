import { describe, it, expect } from "vitest";
import { formatTodo, formatList } from "../../src/format";

describe("format", () => {
  it("marks completed todos with [x]", () => {
    expect(formatTodo({ id: 1, title: "milk", completed: true })).toContain("[x]");
    expect(formatTodo({ id: 2, title: "eggs", completed: false })).toContain("[ ]");
  });
  it("lists todos one per line", () => {
    expect(formatList([
      { id: 1, title: "milk", completed: true },
      { id: 2, title: "eggs", completed: false },
    ])).toBe("[x] milk\n[ ] eggs");
  });
});
