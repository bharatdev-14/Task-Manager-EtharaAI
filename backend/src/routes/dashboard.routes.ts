import { Router } from "express";
import {
  getDashboard,
  getOverdueTasks,
  getRecentActivity,
  getTasksByStatus,
  getTasksPerUser,
  getTotalTasks
} from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get("/", getDashboard);
dashboardRouter.get("/total-tasks", getTotalTasks);
dashboardRouter.get("/tasks-by-status", getTasksByStatus);
dashboardRouter.get("/tasks-per-user", getTasksPerUser);
dashboardRouter.get("/overdue-tasks", getOverdueTasks);
dashboardRouter.get("/recent-activity", getRecentActivity);
