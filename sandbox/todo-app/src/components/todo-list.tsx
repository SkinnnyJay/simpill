"use client";

import { partition } from "@simpill/array.utils";
import { useTodoStore } from "@/store/todo-store";
import { TodoItem } from "./todo-item";

export function TodoList() {
  const todos = useTodoStore((s) => s.todos);
  const filter = useTodoStore((s) => s.filter);

  const [completed, active] = partition(todos, (t) => t.completed);
  const ordered = [...active, ...completed];
  const visible =
    filter === "all" ? ordered : filter === "active" ? active : completed;

  if (todos.length === 0) {
    return (
      <p className="text-center text-zinc-500 py-8" data-testid="todo-empty">
        No todos yet. Add one above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2" data-testid="todo-list">
      {visible.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
