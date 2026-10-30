import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands use completed", () => {
  it("add creates an incomplete todo", () => {
    const todos = add([], "buy milk", "2026-11-01");
    expect(todos).toHaveLength(1);
    expect(todos[0].completed).toBe(false);
    expect("done" in todos[0]).toBe(false);
  });
  it("complete sets completed to true", () => {
    const todos = complete(add([], "walk dog"), 1);
    expect(todos[0].completed).toBe(true);
    expect("done" in todos[0]).toBe(false);
  });
});
