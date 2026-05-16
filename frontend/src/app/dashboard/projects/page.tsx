"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import { isProjectAdmin } from "@/lib/permissions";
import { Project } from "@/types";

export default function ProjectsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { projects, isLoading, isMutating, createProject, deleteProject } = useProjects();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return projects;
    }

    return projects.filter((project) => `${project.name} ${project.description ?? ""}`.toLowerCase().includes(term));
  }, [projects, query]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.trim().length < 2) {
      toast({ title: "Project name is too short", description: "Use at least 2 characters.", variant: "error" });
      return;
    }

    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined
      });
      setName("");
      setDescription("");
      setIsCreateOpen(false);
    } catch {
      toast({ title: "Project was not created", description: "Please check the form and try again.", variant: "error" });
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) {
      return;
    }

    try {
      await deleteProject(projectToDelete);
      setProjectToDelete(null);
    } catch {
      toast({ title: "Project was not deleted", description: "Only project admins can delete projects.", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Projects</h1>
          <p className="mt-1 text-sm text-muted">Plan work, manage members, and keep task delivery visible.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 md:max-w-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects"
          type="search"
        />
        <p className="text-sm text-muted">{filteredProjects.length} visible projects</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-brand-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-base font-semibold text-ink">No projects found</h2>
          <p className="mt-2 text-sm text-muted">Create a project to start assigning members and tasks.</p>
          <Button className="mt-5" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </Card>
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="flex min-h-[220px] flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/dashboard/projects/${project.id}`} className="min-w-0">
                  <h2 className="line-clamp-2 text-base font-semibold text-ink hover:text-brand-700">{project.name}</h2>
                </Link>
                {isProjectAdmin(project, user) ? (
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-red-50 hover:text-red-700"
                    onClick={() => setProjectToDelete(project)}
                    aria-label={`Delete ${project.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-3 min-h-16 text-sm text-muted">
                {project.description || "No description yet."}
              </p>
              <div className="mt-auto grid grid-cols-2 gap-3 pt-5 text-sm">
                <div className="rounded-md border border-border p-3">
                  <div className="flex items-center gap-2 text-muted">
                    <Users className="h-4 w-4" />
                    Members
                  </div>
                  <p className="mt-2 font-semibold text-ink">{project.members?.length ?? 0}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="flex items-center gap-2 text-muted">
                    <CalendarDays className="h-4 w-4" />
                    Tasks
                  </div>
                  <p className="mt-2 font-semibold text-ink">{project._count?.tasks ?? 0}</p>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create project"
        description="Set up a workspace for tasks and members."
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <label className="block">
            <span className="text-sm font-medium text-ink">Name</span>
            <input
              className="mt-1 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Description</span>
            <textarea
              className="mt-1 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? "Creating..." : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Delete project"
        description={`Delete ${projectToDelete?.name ?? "this project"} and all related tasks?`}
        isSubmitting={isMutating}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
