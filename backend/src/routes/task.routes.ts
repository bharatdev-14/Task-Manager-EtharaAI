import { ProjectRole } from "@prisma/client";
import { Router } from "express";
import {
  assignTask,
  createTask,
  deleteTask,
  getTask,
  listMyTasks,
  listProjectTasks,
  updateTask,
  updateTaskStatus
} from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireTaskAdmin, requireTaskAdminOrAssignee } from "../middleware/taskAccess.middleware";
import { requireProjectRole, requireTaskProjectRole } from "../middleware/projectAccess.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  assignTaskSchema,
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema
} from "../validators/task.validator";

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get("/tasks", validate(taskQuerySchema), listMyTasks);
taskRouter.get("/projects/:projectId/tasks", requireProjectRole(ProjectRole.MEMBER), validate(taskQuerySchema), listProjectTasks);
taskRouter.post("/projects/:projectId/tasks", requireProjectRole(ProjectRole.ADMIN), validate(createTaskSchema), createTask);
taskRouter.get("/tasks/:id", requireTaskProjectRole(ProjectRole.MEMBER), getTask);
taskRouter.patch("/tasks/:id", requireTaskAdminOrAssignee, validate(updateTaskSchema), updateTask);
taskRouter.patch("/tasks/:id/assign", requireTaskAdmin, validate(assignTaskSchema), assignTask);
taskRouter.patch("/tasks/:id/status", requireTaskAdminOrAssignee, validate(updateTaskStatusSchema), updateTaskStatus);
taskRouter.delete("/tasks/:id", requireTaskAdmin, deleteTask);
