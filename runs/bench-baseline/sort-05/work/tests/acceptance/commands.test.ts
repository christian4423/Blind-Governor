import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("list due-date ordering", () => {
  it("lists todos with due dates before todos without", () => {
    const todos = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2030-01-01" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2029-05-05" },
    ];
    const out = list(todos, { includeDone: true });
    const iA = out.indexOf("alpha-nodue");
    const iB = out.indexOf("bravo-due");
    const iC = out.indexOf("charlie-nodue");
    const iD = out.indexOf("delta-due");
    for (const i of [iA, iB, iC, iD]) expect(i).toBeGreaterThanOrEqual(0);
    expect(Math.max(iB, iD)).toBeLessThan(Math.min(iA, iC));
  });
});
