"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { projectService, AddMemberInput, UpdateProjectInput } from "@/services/project.service";
import { Project } from "@/types";

export function useProject(projectId: string) {
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await projectService.get(projectId);
      setProject(data);
    } catch {
      toast({ title: "Project failed to load", description: "The project may not exist.", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const updateProject = useCallback(
    async (input: UpdateProjectInput) => {
      setIsMutating(true);
      try {
        const updated = await projectService.update(projectId, input);
        setProject((current) => (current ? { ...current, ...updated } : updated));
        toast({ title: "Project updated", variant: "success" });
      } finally {
        setIsMutating(false);
      }
    },
    [projectId, toast]
  );

  const addMember = useCallback(
    async (input: AddMemberInput) => {
      setIsMutating(true);
      try {
        await projectService.addMember(projectId, input);
        await loadProject();
        toast({ title: "Member added", description: input.email, variant: "success" });
      } finally {
        setIsMutating(false);
      }
    },
    [loadProject, projectId, toast]
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      setIsMutating(true);
      try {
        await projectService.removeMember(projectId, memberId);
        await loadProject();
        toast({ title: "Member removed", variant: "success" });
      } finally {
        setIsMutating(false);
      }
    },
    [loadProject, projectId, toast]
  );

  return {
    project,
    isLoading,
    isMutating,
    refresh: loadProject,
    updateProject,
    addMember,
    removeMember
  };
}
