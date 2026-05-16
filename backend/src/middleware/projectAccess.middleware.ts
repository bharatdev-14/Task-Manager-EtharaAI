import { ProjectRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { canAccessProject } from "../rbac/permissions";
import { ApiError } from "../utils/apiError";

export const requireProjectRole =
  (minimumRole: ProjectRole) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Authentication is required"));
      }

      const projectId = req.params.projectId ?? req.params.id;
      if (!projectId) {
        return next(new ApiError(400, "Project id is required"));
      }

      const projectExists = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true }
      });

      if (!projectExists) {
        return next(new ApiError(404, "Project not found"));
      }

      if (!(await canAccessProject(req.user.id, projectId, minimumRole))) {
        return next(new ApiError(403, "Project access denied"));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };

export const requireTaskProjectRole =
  (minimumRole: ProjectRole) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Authentication is required"));
      }

      const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        select: {
          projectId: true,
          project: {
            select: {
              adminId: true
            }
          }
        }
      });

      if (!task) {
        return next(new ApiError(404, "Task not found"));
      }

      if (!(await canAccessProject(req.user.id, task.projectId, minimumRole))) {
        return next(new ApiError(403, "Task access denied"));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
