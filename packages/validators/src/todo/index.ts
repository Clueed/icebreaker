import { z } from "zod";

export const todoSchema = z.object({
  name: z.string().min(1),
  done: z.boolean(),
  description: z.string().optional(),
});

export type Todo = z.infer<typeof todoSchema>;
