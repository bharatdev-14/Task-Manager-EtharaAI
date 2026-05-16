import { ProjectRole } from "@prisma/client";
import { prisma } from "../config/prisma";

const roleRank: Record<ProjectRole, number> = {
  MEMBER: 1,
  ADMIN: 2
};

export type ProjectPermission = "project:read" | "project:update" | "project:delete" | "member:manage" | "task:create";
export type TaskPermission = "task:read" | "task:update" | "task:delete" | "task:assign" | "task:status";

export function hasMinimumProjectRole(actualRole: ProjectRole | null | undefined, requiredRole: ProjectRole) {
  return Boolean(actualRole && roleRank[actualRole] >= roleRank[requiredRole]);
}

export async function getProjectRole(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { adminId: true }
  });

  if (!project) {
    return null;
  }

  if (project.adminId === userId) {
    return ProjectRole.ADMIN;
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId
      }
    }
  });

  return membership?.role ?? null;
}

export async function canAccessProject(userId: string, projectId: string, requiredRole: ProjectRole) {
  return hasMinimumProjectRole(await getProjectRole(userId, projectId), requiredRole);
}

export async function canUpdateTask(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      assignedToId: true,
      projectId: true
    }
  });

  if (!task) {
    return false;
  }

  if (task.assignedToId === userId) {
    return true;
  }

  return canAccessProject(userId, task.projectId, ProjectRole.ADMIN);
}

export async function canManageTask(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true }
  });

  if (!task) {
    return false;
  }

  return canAccessProject(userId, task.projectId, ProjectRole.ADMIN);
}
