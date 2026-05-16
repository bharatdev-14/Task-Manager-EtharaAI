"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { canCreateTask, canDeleteTask, canUpdateTask, isProjectAdmin } from "@/lib/permissions";
import { Project, Task } from "@/types";

export function useProjectPermissions(project?: Project | null) {
  const { user } = useAuth();

  return useMemo(
    () => ({
      isAdmin: isProjectAdmin(project, user),
      canCreateTask: canCreateTask(project, user),
      canDeleteTask: (_task: Task) => canDeleteTask(project, user),
      canUpdateTask: (task: Task) => canUpdateTask(project, task, user)
    }),
    [project, user]
  );
}
