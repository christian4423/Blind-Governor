import { describe, it, expect } from "vitest";
import { formatTodo } from "../../src/format";

describe("format uses completed", () => {
  it("renders the checkbox from completed", () => {
    expect(formatTodo({ id: 1, title: "a", completed: true })).toContain("[x]");
    expect(formatTodo({ id: 1, title: "a", completed: false })).toContain("[ ]");
  });
});
