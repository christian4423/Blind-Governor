import { describe, it, expect } from "vitest";
import { formatTodo, formatList } from "../../src/format";

describe("format uses completed", () => {
  it("renders checkbox from completed", () => {
    expect(formatTodo({ id: 1, title: "walk dog", completed: true })).toContain("[x]");
    expect(formatTodo({ id: 2, title: "buy milk", completed: false })).toContain("[ ]");
    const out = formatList([
      { id: 1, title: "walk dog", completed: true },
      { id: 2, title: "buy milk", completed: false },
    ]);
    expect(out).toContain("[x] walk dog");
    expect(out).toContain("[ ] buy milk");
  });
});
