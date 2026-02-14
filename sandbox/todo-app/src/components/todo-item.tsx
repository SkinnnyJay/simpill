"use client";

import { useStableCallback } from "@simpill/react.utils";
import { useState } from "react";
import { useTodoStore } from "@/store/todo-store";
import type { Todo } from "@/lib/schema";

export function TodoItem({ todo }: { todo: Todo }) {
  const toggleTodo = useTodoStore((s) => s.toggleTodo);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleToggle = useStableCallback(() => toggleTodo(todo.id), [toggleTodo, todo.id]);
  const handleDelete = useStableCallback(() => deleteTodo(todo.id), [deleteTodo, todo.id]);
  const handleSaveEdit = useStableCallback(() => {
    const t = editTitle.trim();
    if (t) updateTodo(todo.id, t);
    setEditing(false);
  }, [updateTodo, todo.id, editTitle]);

  return (
    <li
      className="group flex items-center gap-3 rounded-lg border border-zinc-700/50 bg-zinc-900/30 px-4 py-3 transition-all hover:border-zinc-600"
      data-testid={`todo-item-${todo.id}`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className="h-5 w-5 rounded border-zinc-600 bg-zinc-800 text-cyan-600 focus:ring-cyan-500"
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
      />
      {editing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveEdit();
            if (e.key === "Escape") {
              setEditTitle(todo.title);
              setEditing(false);
            }
          }}
          autoFocus
          className="flex-1 rounded border border-cyan-500/50 bg-zinc-800 px-2 py-1 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className={`flex-1 cursor-pointer select-none ${todo.completed ? "text-zinc-500 line-through" : "text-zinc-100"}`}
        >
          {todo.title}
        </span>
      )}
      <button
        type="button"
        onClick={handleDelete}
        className="rounded p-1.5 text-zinc-400 opacity-0 transition-opacity hover:bg-red-900/30 hover:text-red-400 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label={`Delete "${todo.title}"`}
      >
        <span aria-hidden>×</span>
      </button>
    </li>
  );
}
