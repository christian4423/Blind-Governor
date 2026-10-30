import { describe, it, expect } from "vitest";
import { load, save } from "../../src/storage";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

function tmpFile(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "todo-acc-"));
  return path.join(dir, "todos.json");
}

describe("storage completed field", () => {
  it("round-trips completed and never writes done", () => {
    const p = tmpFile();
    save(p, [{ id: 1, title: "a", completed: true }, { id: 2, title: "b", completed: false }]);
    const raw = fs.readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toContain("\"done\"");
    const loaded = load(p);
    expect(loaded.map((t) => t.completed)).toEqual([true, false]);
  });

  it("maps legacy done field to completed on load", () => {
    const p = tmpFile();
    fs.writeFileSync(p, JSON.stringify([{ id: 1, title: "old", done: true }]));
    const loaded = load(p);
    expect(loaded[0].completed).toBe(true);
    expect("done" in loaded[0]).toBe(false);
  });
});
