import { Prisma, TaskStatus } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const userProjectWhere = (userId: string): Prisma.ProjectWhereInput => ({
  OR: [
    { adminId: userId },
    {
      members: {
        some: {
          userId
        }
      }
    }
  ]
});

const userTaskWhere = (userId: string): Prisma.TaskWhereInput => ({
  project: userProjectWhere(userId)
});

const taskSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
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
  }
};

function requireUser(req: Request) {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required");
  }

  return req.user;
}

export const getTotalTasks = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const [total, completed, open] = await Promise.all([
    prisma.task.count({ where: userTaskWhere(user.id) }),
    prisma.task.count({ where: { ...userTaskWhere(user.id), status: TaskStatus.DONE } }),
    prisma.task.count({ where: { ...userTaskWhere(user.id), status: { not: TaskStatus.DONE } } })
  ]);

  return apiResponse.success(res, { total, completed, open }, "Task totals retrieved");
});

export const getTasksByStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const grouped = await prisma.task.groupBy({
    by: ["status"],
    where: userTaskWhere(user.id),
    _count: {
      status: true
    }
  });

  const data = Object.values(TaskStatus).map((status) => ({
    status,
    count: grouped.find((item) => item.status === status)?._count.status ?? 0
  }));

  return apiResponse.success(res, data, "Tasks by status retrieved");
});

export const getTasksPerUser = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const members = await prisma.projectMember.findMany({
    where: {
      project: userProjectWhere(user.id)
    },
    distinct: ["userId"],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              assignedTasks: {
                where: userTaskWhere(user.id)
              }
            }
          }
        }
      }
    }
  });

  const data = members.map((member) => ({
    userId: member.user.id,
    name: member.user.name,
    email: member.user.email,
    tasks: member.user._count.assignedTasks
  }));

  return apiResponse.success(res, data, "Tasks per user retrieved");
});

export const getOverdueTasks = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const tasks = await prisma.task.findMany({
    where: {
      ...userTaskWhere(user.id),
      status: { not: TaskStatus.DONE },
      dueDate: { lt: new Date() }
    },
    select: taskSelect,
    orderBy: { dueDate: "asc" },
    take: 10
  });

  return apiResponse.success(res, tasks, "Overdue tasks retrieved");
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const tasks = await prisma.task.findMany({
    where: userTaskWhere(user.id),
    select: taskSelect,
    orderBy: { updatedAt: "desc" },
    take: 10
  });

  return apiResponse.success(res, tasks, "Recent activity retrieved");
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const taskWhere = userTaskWhere(user.id);
  const projectWhere = userProjectWhere(user.id);

  const [projectCount, taskTotals, groupedByStatus, groupedByUser, overdueTasks, recentActivity] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, assignedToId: user.id } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          status: { not: TaskStatus.DONE },
          dueDate: { lt: new Date() }
        }
      }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.DONE } })
    ]),
    prisma.task.groupBy({
      by: ["status"],
      where: taskWhere,
      _count: { status: true }
    }),
    prisma.projectMember.findMany({
      where: { project: projectWhere },
      distinct: ["userId"],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            _count: {
              select: {
                assignedTasks: {
                  where: taskWhere
                }
              }
            }
          }
        }
      }
    }),
    prisma.task.findMany({
      where: {
        ...taskWhere,
        status: { not: TaskStatus.DONE },
        dueDate: { lt: new Date() }
      },
      select: taskSelect,
      orderBy: { dueDate: "asc" },
      take: 6
    }),
    prisma.task.findMany({
      where: taskWhere,
      select: taskSelect,
      orderBy: { updatedAt: "desc" },
      take: 8
    })
  ]);

  const [taskCount, assignedToMeCount, overdueCount, completedCount] = taskTotals;

  return apiResponse.success(res, {
    totals: {
      projects: projectCount,
      tasks: taskCount,
      assignedToMe: assignedToMeCount,
      overdue: overdueCount,
      completed: completedCount
    },
    tasksByStatus: Object.values(TaskStatus).map((status) => ({
      status,
      count: groupedByStatus.find((item) => item.status === status)?._count.status ?? 0
    })),
    tasksPerUser: groupedByUser.map((member) => ({
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      tasks: member.user._count.assignedTasks
    })),
    overdueTasks,
    recentActivity
  });
});
