import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("list ordering by due presence", () => {
  const make = () => [
    { id: 1, title: "alpha-nodue", done: false },
    { id: 2, title: "bravo-due", done: false, due: "2024-05-01" },
    { id: 3, title: "charlie-nodue", done: false },
    { id: 4, title: "delta-due", done: false, due: "2024-01-01" },
  ];

  it("puts items with due dates before items without", () => {
    const out = list(make());
    const a = out.indexOf("alpha-nodue");
    const b = out.indexOf("bravo-due");
    const c = out.indexOf("charlie-nodue");
    const d = out.indexOf("delta-due");
    for (const i of [a, b, c, d]) expect(i).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(a);
    expect(b).toBeLessThan(c);
    expect(d).toBeLessThan(a);
    expect(d).toBeLessThan(c);
  });

  it("keeps relative order of undated items", () => {
    const out = list(make());
    expect(out.indexOf("alpha-nodue")).toBeLessThan(out.indexOf("charlie-nodue"));
  });

  it("does not mutate the input", () => {
    const todos = make();
    const before = JSON.stringify(todos);
    list(todos);
    expect(JSON.stringify(todos)).toBe(before);
  });
});
