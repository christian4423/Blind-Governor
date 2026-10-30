import { describe, it, expect } from "vitest";
import { formatTodo, formatList } from "../../src/format";

describe("format uses completed", () => {
  it("renders completed todos with [x]", () => {
    const s = formatTodo({ id: 2, title: "walk dog", completed: true });
    expect(s.startsWith("[x]")).toBe(true);
    expect(s).toContain("walk dog");
  });
  it("renders incomplete todos with [ ]", () => {
    const s = formatTodo({ id: 1, title: "buy milk", completed: false });
    expect(s.startsWith("[ ]")).toBe(true);
    expect(s).toContain("buy milk");
  });
  it("formatList includes both", () => {
    const s = formatList([
      { id: 1, title: "buy milk", completed: false },
      { id: 2, title: "walk dog", completed: true },
    ]);
    expect(s).toContain("[ ] buy milk");
    expect(s).toContain("[x] walk dog");
  });
});
