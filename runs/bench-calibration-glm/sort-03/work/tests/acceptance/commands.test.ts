import { describe, expect, it } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

const mixed: Todo[] = [
  { id: 1, title: "plain-alpha", done: false },
  { id: 2, title: "dated-beta", done: false, due: "2030-01-15" },
  { id: 3, title: "plain-gamma", done: false },
  { id: 4, title: "dated-delta", done: false, due: "2031-08-02" },
];

function firstIndexOf(out: string, title: string): number {
  return out.indexOf(title);
}

describe("list: due-date ordering", () => {
  it("renders todos with due dates before todos without", () => {
    const out = list(mixed);
    const datedBeta = firstIndexOf(out, "dated-beta");
    const datedDelta = firstIndexOf(out, "dated-delta");
    const plainAlpha = firstIndexOf(out, "plain-alpha");
    const plainGamma = firstIndexOf(out, "plain-gamma");
    expect(datedBeta).toBeGreaterThanOrEqual(0);
    expect(datedDelta).toBeGreaterThanOrEqual(0);
    expect(plainAlpha).toBeGreaterThanOrEqual(0);
    expect(plainGamma).toBeGreaterThanOrEqual(0);
    expect(datedBeta).toBeLessThan(plainAlpha);
    expect(datedDelta).toBeLessThan(plainGamma);
  });

  it("preserves the relative order of todos within each group", () => {
    const out = list(mixed);
    expect(firstIndexOf(out, "dated-beta")).toBeLessThan(firstIndexOf(out, "dated-delta"));
    expect(firstIndexOf(out, "plain-alpha")).toBeLessThan(firstIndexOf(out, "plain-gamma"));
  });

  it("treats an empty due string as having no due date", () => {
    const todos: Todo[] = [
      { id: 1, title: "empty-due-item", done: false, due: "" },
      { id: 2, title: "dated-epsilon", done: false, due: "2030-05-05" },
    ];
    const out = list(todos);
    expect(firstIndexOf(out, "dated-epsilon")).toBeGreaterThanOrEqual(0);
    expect(firstIndexOf(out, "empty-due-item")).toBeGreaterThanOrEqual(0);
    expect(firstIndexOf(out, "dated-epsilon")).toBeLessThan(firstIndexOf(out, "empty-due-item"));
  });
});
