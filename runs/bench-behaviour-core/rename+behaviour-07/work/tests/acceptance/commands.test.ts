import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { add, complete, run } from "../../src/commands";

describe("commands use completed", () => {
  it("add creates incomplete todos and complete marks them completed", () => {
    const todos = add([], "x");
    expect(todos[0].completed).toBe(false);
    const after = complete(todos, todos[0].id);
    expect(after[0].completed).toBe(true);
  });
  it("run persists completed to disk", () => {
    const p = join(mkdtempSync(join(tmpdir(), "cm-")), "todos.json");
    run(p, { kind: "add", title: "x" });
    run(p, { kind: "complete", id: 1 });
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
  });
});
