import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands use completed", () => {
  it("add creates incomplete todos without done", () => {
    const todos = add([], "buy milk");
    expect(todos[0].completed).toBe(false);
    expect("done" in todos[0]).toBe(false);
  });
  it("complete sets completed", () => {
    const todos = complete(add([], "walk dog"), 1);
    expect(todos[0].completed).toBe(true);
    expect("done" in todos[0]).toBe(false);
  });
});
