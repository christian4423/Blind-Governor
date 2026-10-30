import { describe, it, expect } from "vitest";
import { formatTodo } from "../../src/format";

describe("format completed", () => {
  it("marks completed todos with [x]", () => {
    expect(formatTodo({ id: 2, title: "walk dog", completed: true })).toContain("[x]");
    expect(formatTodo({ id: 1, title: "buy milk", completed: false })).toContain("[ ]");
  });
});
