"use client";

import { useTodoStore } from "@/store/todo-store";
import type { FilterKind } from "@/store/todo-store";

const filters: { value: FilterKind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export function TodoFilters() {
  const filter = useTodoStore((s) => s.filter);
  const setFilter = useTodoStore((s) => s.setFilter);

  return (
    <div className="flex gap-2" role="tablist" aria-label="Filter todos">
      {filters.map((f) => (
        <button
          key={f.value}
          type="button"
          role="tab"
          aria-selected={filter === f.value}
          onClick={() => setFilter(f.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            filter === f.value
              ? "bg-cyan-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
