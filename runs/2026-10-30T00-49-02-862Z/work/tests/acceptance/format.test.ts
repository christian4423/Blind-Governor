import { describe, it, expect } from "vitest";
import { formatTodoVerbose, formatListVerbose } from "../../src/format";

describe("formatTodoVerbose", () => {
  it("renders done todo with due", () => {
    expect(formatTodoVerbose({ id: 3, title: "Buy milk", done: true, due: "2024-06-01" })).toBe("#3 [x] Buy milk (due 2024-06-01)");
  });
  it("renders open todo without due", () => {
    expect(formatTodoVerbose({ id: 1, title: "Walk dog", done: false })).toBe("#1 [ ] Walk dog");
  });
});

describe("formatListVerbose", () => {
  it("lists all todos plus summary", () => {
    const out = formatListVerbose([
      { id: 1, title: "Walk dog", done: false },
      { id: 2, title: "Pay rent", done: false, due: "2024-07-01" },
      { id: 3, title: "Buy milk", done: true, due: "2024-06-01" },
    ]);
    expect(out).toBe("#1 [ ] Walk dog\n#2 [ ] Pay rent (due 2024-07-01)\n#3 [x] Buy milk (due 2024-06-01)\n2 open, 1 done");
  });
  it("empty list gives only summary", () => {
    expect(formatListVerbose([])).toBe("0 open, 0 done");
  });
});
