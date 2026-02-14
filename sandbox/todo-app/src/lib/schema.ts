import { z } from "zod";

export const todoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  completed: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
});

export const addTodoSchema = z.object({
  title: z.string().min(1, "Title required").max(500),
});

export type Todo = z.infer<typeof todoSchema>;
export type AddTodoInput = z.infer<typeof addTodoSchema>;
