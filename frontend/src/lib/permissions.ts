import { Project, Task, User } from "@/types";

export function isProjectAdmin(project: Project | undefined | null, user: User | null) {
  if (!project || !user) {
    return false;
  }

  return project.admin.id === user.id || Boolean(project.members?.some((member) => member.userId === user.id && member.role === "ADMIN"));
}

export function canCreateTask(project: Project | undefined | null, user: User | null) {
  return isProjectAdmin(project, user);
}

export function canDeleteTask(project: Project | undefined | null, user: User | null) {
  return isProjectAdmin(project, user);
}

export function canUpdateTask(project: Project | undefined | null, task: Task, user: User | null) {
  return isProjectAdmin(project, user) || task.assignedTo?.id === user?.id;
}
