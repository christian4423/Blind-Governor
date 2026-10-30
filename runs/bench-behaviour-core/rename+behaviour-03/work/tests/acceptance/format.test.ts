import { describe, it, expect } from "vitest";
import { formatTodo } from "../../src/format";

describe("format with completed", () => {
  it("marks completed todos with [x]", () => {
    expect(formatTodo({ id: 1, title: "walk dog", completed: true })).toContain("[x] walk dog");
    expect(formatTodo({ id: 2, title: "buy milk", completed: false })).toContain("[ ] buy milk");
  });
});
