"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { taskService, TaskFilters, TaskInput } from "@/services/task.service";
import { Task, TaskStatus } from "@/types";

type UseTasksOptions = {
  projectId?: string;
  filters?: TaskFilters;
};

export function useTasks({ projectId, filters }: UseTasksOptions = {}) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [total, setTotal] = useState(0);
  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);
  const stableFilters = useMemo(() => JSON.parse(filtersKey) as TaskFilters, [filtersKey]);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = projectId
        ? await taskService.listProject(projectId, stableFilters)
        : await taskService.listMine(stableFilters);
      setTasks(result.data);
      setTotal(result.meta?.total ?? result.data.length);
    } catch {
      toast({ title: "Tasks failed to load", description: "Please try again.", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, stableFilters, toast]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(
    async (input: TaskInput) => {
      if (!projectId) {
        throw new Error("projectId is required to create a task");
      }

      setIsMutating(true);
      try {
        const task = await taskService.create(projectId, input);
        setTasks((current) => [task, ...current]);
        toast({ title: "Task created", description: task.title, variant: "success" });
        return task;
      } finally {
        setIsMutating(false);
      }
    },
    [projectId, toast]
  );

  const updateTask = useCallback(
    async (id: string, input: TaskInput) => {
      setIsMutating(true);
      try {
        const task = await taskService.update(id, input);
        setTasks((current) => current.map((item) => (item.id === id ? task : item)));
        toast({ title: "Task updated", variant: "success" });
        return task;
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  const updateStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));

      try {
        const task = await taskService.updateStatus(id, status);
        setTasks((current) => current.map((item) => (item.id === id ? task : item)));
      } catch {
        await loadTasks();
        toast({ title: "Status was not updated", description: "Members can only update assigned tasks.", variant: "error" });
      }
    },
    [loadTasks, toast]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setIsMutating(true);
      try {
        await taskService.remove(id);
        setTasks((current) => current.filter((task) => task.id !== id));
        toast({ title: "Task deleted", variant: "success" });
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  return {
    tasks,
    total,
    isLoading,
    isMutating,
    refresh: loadTasks,
    createTask,
    updateTask,
    updateStatus,
    deleteTask
  };
}
