import { describe, it, expect } from "vitest";
import { add, complete, list, run } from "../../src/commands";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("commands use completed", () => {
  it("add creates completed: false", () => {
    const t = add([], "a");
    expect(t[0].completed).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(t[0], "done")).toBe(false);
  });
  it("complete sets completed: true", () => {
    const t = complete([{ id: 1, title: "a", completed: false }], 1);
    expect(t[0].completed).toBe(true);
  });
  it("list shows completed todos with [x]", () => {
    const out = list([{ id: 1, title: "a", completed: true }, { id: 2, title: "b", completed: false }], { includeDone: true });
    expect(out).toContain("[x] a");
    expect(out).toContain("[ ] b");
  });
  it("run persists completed in the file", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-acc-")), "todos.json");
    run(p, { kind: "add", title: "a" });
    run(p, { kind: "complete", id: 1 });
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(raw[0], "done")).toBe(false);
  });
});
