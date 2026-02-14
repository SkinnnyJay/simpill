"use client";

import { useStableCallback } from "@simpill/react.utils";
import { safeParseResult } from "@simpill/zod.utils";
import { useState } from "react";
import { useTodoStore } from "@/store/todo-store";
import { addTodoSchema } from "@/lib/schema";

export function TodoForm() {
  const addTodo = useTodoStore((s) => s.addTodo);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useStableCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const parsed = safeParseResult(addTodoSchema, { title });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Invalid");
        return;
      }
      addTodo(parsed.data.title);
      setTitle("");
    },
    [addTodo]
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
        aria-label="New todo title"
      />
      <button
        type="submit"
        className="rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
      >
        Add
      </button>
      {error ? (
        <p className="absolute mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
