import { describe, it, expect } from "vitest";
import { formatTodo } from "../../src/format";

describe("format completed field", () => {
  it("renders completed todos with [x]", () => {
    expect(formatTodo({ id: 1, title: "walk dog", completed: true })).toContain("[x] walk dog");
  });
  it("renders incomplete todos with [ ]", () => {
    expect(formatTodo({ id: 1, title: "buy milk", completed: false })).toContain("[ ] buy milk");
  });
});
