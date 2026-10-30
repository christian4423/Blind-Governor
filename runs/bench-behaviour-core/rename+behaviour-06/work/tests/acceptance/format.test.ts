import { describe, it, expect } from "vitest";
import { formatTodo } from "../../src/format";

describe("format uses completed", () => {
  it("renders completed todos with [x]", () => {
    expect(formatTodo({ id: 1, title: "walk dog", completed: true })).toContain("[x]");
  });
  it("renders incomplete todos with [ ]", () => {
    expect(formatTodo({ id: 1, title: "buy milk", completed: false })).toContain("[ ]");
  });
});
