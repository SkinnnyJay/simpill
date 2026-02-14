/** Command with execute and optional undo. */
export type Command<TInput, TResult> = {
  execute: (input: TInput) => TResult;
  undo?: (input: TInput, result: TResult) => void;
};

/** Result of running a command, with optional undo callback. */
export type CommandExecution<TResult> = {
  result: TResult;
  undo?: () => void;
};

/** Wrap an action (and optional undo) in a typed command object. */
export function createCommand<TInput, TResult>(
  command: Command<TInput, TResult>
): Command<TInput, TResult> {
  return command;
}

/**
 * Execute a command with the given input.
 * @param command - Command to run
 * @param input - Input for execute
 * @returns command.execute(input)
 */
export function runCommand<TInput, TResult>(
  command: Command<TInput, TResult>,
  input: TInput
): TResult {
  return command.execute(input);
}

/**
 * Execute a command and return result plus optional undo function.
 * @param command - Command to run
 * @param input - Input for execute
 * @returns Object with result and optional undo() that calls command.undo
 */
export function runCommandWithUndo<TInput, TResult>(
  command: Command<TInput, TResult>,
  input: TInput
): CommandExecution<TResult> {
  const result = command.execute(input);
  if (!command.undo) {
    return { result };
  }
  return {
    result,
    undo: () => {
      command.undo?.(input, result);
    },
  };
}
