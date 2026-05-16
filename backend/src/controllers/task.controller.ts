import { Prisma, ProjectRole, TaskPriority, TaskStatus } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const taskInclude = {
  project: {
    select: {
      id: true,
      name: true
    }
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
};

export const listProjectTasks = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 50);
  const skip = (page - 1) * limit;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const due = req.query.due;

  const where: Prisma.TaskWhereInput = {
    projectId: req.params.projectId,
    ...(req.query.status ? { status: req.query.status as TaskStatus } : {}),
    ...(req.query.priority ? { priority: req.query.priority as TaskPriority } : {}),
    ...(req.query.assignedToId ? { assignedToId: String(req.query.assignedToId) } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(due === "overdue"
      ? { dueDate: { lt: new Date() }, status: { not: TaskStatus.DONE } }
      : due === "today"
        ? {
            dueDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        : due === "upcoming"
          ? { dueDate: { gt: new Date() } }
          : {})
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit
    }),
    prisma.task.count({ where })
  ]);

  return apiResponse.success(res, tasks, "Tasks retrieved", 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

const ensureProjectMember = async (projectId: string, userId?: string | null) => {
  if (!userId) {
    return;
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId
      }
    }
  });

  if (!member) {
    throw new ApiError(400, "Assigned user must be a project member");
  }
};

const isProjectAdmin = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { adminId: true }
  });

  if (project?.adminId === userId) {
    return true;
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId
      }
    }
  });

  return membership?.role === ProjectRole.ADMIN;
};

export const listMyTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required");
  }

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 50);
  const skip = (page - 1) * limit;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  const where: Prisma.TaskWhereInput = {
    project: {
      OR: [
        { adminId: req.user.id },
        {
          members: {
            some: {
              userId: req.user.id
            }
          }
        }
      ]
    },
    ...(req.query.status ? { status: req.query.status as TaskStatus } : {}),
    ...(req.query.priority ? { priority: req.query.priority as TaskPriority } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { project: { name: { contains: search, mode: "insensitive" } } }
          ]
        }
      : {})
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit
    }),
    prisma.task.count({ where })
  ]);

  return apiResponse.success(res, tasks, "Tasks retrieved", 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required");
  }

  const { title, description, status, priority, dueDate, assignedToId } = req.body;
  await ensureProjectMember(req.params.projectId, assignedToId);

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedToId,
      projectId: req.params.projectId,
      createdById: req.user.id
    },
    include: taskInclude
  });

  return apiResponse.success(res, task, "Task created", 201);
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: taskInclude
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return apiResponse.success(res, task, "Task retrieved");
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required");
  }

  const { dueDate, ...payload } = req.body;
  const currentTask = await prisma.task.findUnique({
    where: { id: req.params.id },
    select: { projectId: true }
  });

  if (!currentTask) {
    throw new ApiError(404, "Task not found");
  }

  if (payload.assignedToId !== undefined && !(await isProjectAdmin(currentTask.projectId, req.user.id))) {
    throw new ApiError(403, "Only project admins can assign tasks");
  }

  await ensureProjectMember(currentTask.projectId, payload.assignedToId);

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...payload,
      dueDate: dueDate === undefined ? undefined : dueDate === null ? null : new Date(dueDate)
    },
    include: taskInclude
  });

  return apiResponse.success(res, task, "Task updated");
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  return apiResponse.success(res, null, "Task deleted");
});

export const assignTask = asyncHandler(async (req: Request, res: Response) => {
  const currentTask = await prisma.task.findUnique({
    where: { id: req.params.id },
    select: { projectId: true }
  });

  if (!currentTask) {
    throw new ApiError(404, "Task not found");
  }

  await ensureProjectMember(currentTask.projectId, req.body.assignedToId);

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      assignedToId: req.body.assignedToId
    },
    include: taskInclude
  });

  return apiResponse.success(res, task, "Task assigned");
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      status: req.body.status
    },
    include: taskInclude
  });

  return apiResponse.success(res, task, "Task status updated");
});
