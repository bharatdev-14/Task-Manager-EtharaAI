import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { canManageTask, canUpdateTask } from "../rbac/permissions";
import { ApiError } from "../utils/apiError";

export const requireTaskAdmin = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Authentication is required"));
    }

    const task = await prisma.task.findUnique({ where: { id: req.params.id }, select: { id: true } });

    if (!task) {
      return next(new ApiError(404, "Task not found"));
    }

    if (!(await canManageTask(req.user.id, req.params.id))) {
      return next(new ApiError(403, "Only project admins can manage this task"));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireTaskAdminOrAssignee = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Authentication is required"));
    }

    const task = await prisma.task.findUnique({ where: { id: req.params.id }, select: { id: true } });

    if (!task) {
      return next(new ApiError(404, "Task not found"));
    }

    if (!(await canUpdateTask(req.user.id, req.params.id))) {
      return next(new ApiError(403, "Members can only update assigned tasks"));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
