"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { projectService, CreateProjectInput } from "@/services/project.service";
import { Project } from "@/types";

export function useProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await projectService.list();
      setProjects(data);
    } catch {
      toast({ title: "Projects failed to load", description: "Please try again.", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      setIsMutating(true);
      try {
        const project = await projectService.create(input);
        setProjects((current) => [project, ...current]);
        toast({ title: "Project created", description: project.name, variant: "success" });
        return project;
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  const deleteProject = useCallback(
    async (project: Project) => {
      setIsMutating(true);
      try {
        await projectService.remove(project.id);
        setProjects((current) => current.filter((item) => item.id !== project.id));
        toast({ title: "Project deleted", description: project.name, variant: "success" });
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  return {
    projects,
    isLoading,
    isMutating,
    createProject,
    deleteProject,
    refresh: loadProjects
  };
}
