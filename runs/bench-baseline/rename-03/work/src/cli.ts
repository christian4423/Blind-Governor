// Entry point (not a unit): wires argv and the todo file path to commands.run.
import { parseArgs, run } from "./commands";

console.log(run(process.env.TODO_FILE ?? "todos.json", parseArgs(process.argv.slice(2))));
