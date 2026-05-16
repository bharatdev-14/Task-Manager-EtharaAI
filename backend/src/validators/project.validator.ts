import { ProjectRole } from "@prisma/client";
import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Project name must be at least 2 characters").max(120),
    description: z.string().trim().max(1000).optional()
  })
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(1000).nullable().optional()
  })
});

export const addProjectMemberSchema = z.object({
  body: z.object({
    userId: z.string().min(1).optional(),
    email: z.string().trim().email().toLowerCase().optional(),
    role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER)
  }).refine((value) => value.userId || value.email, {
    message: "Either userId or email is required",
    path: ["email"]
  })
});
