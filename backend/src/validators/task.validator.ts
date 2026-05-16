import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

const dueDateSchema = z
  .string()
  .datetime()
  .refine((value) => new Date(value).getTime() >= Date.now() - 60 * 1000, {
    message: "Due date cannot be in the past"
  });

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().max(2000).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: dueDateSchema.optional(),
    assignedToId: z.string().optional()
  })
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: dueDateSchema.nullable().optional(),
    assignedToId: z.string().nullable().optional()
  })
});

export const taskQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    search: z.string().trim().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignedToId: z.string().optional(),
    due: z.enum(["overdue", "today", "upcoming"]).optional()
  })
});

export const assignTaskSchema = z.object({
  body: z.object({
    assignedToId: z.string().nullable()
  })
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(TaskStatus)
  })
});
