"use client";

import { useTodoStore } from "@/store/todo-store";

export function ClearCompleted() {
  const todos = useTodoStore((s) => s.todos);
  const clearCompleted = useTodoStore((s) => s.clearCompleted);
  const hasCompleted = todos.some((t) => t.completed);

  if (!hasCompleted) return null;

  return (
    <button
      type="button"
      onClick={clearCompleted}
      className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
    >
      Clear completed
    </button>
  );
}
