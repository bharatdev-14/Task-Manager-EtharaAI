"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ForbiddenNotice } from "@/components/auth/ForbiddenNotice";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { useToast } from "@/components/providers/ToastProvider";
import { useProjects } from "@/hooks/useProjects";
import { useProjectPermissions } from "@/hooks/usePermissions";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskPriority, TaskStatus } from "@/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const TaskModal = dynamic(() => import("@/components/tasks/TaskModal").then((mod) => mod.TaskModal), {
  ssr: false
});

export default function TasksPage() {
  const { toast } = useToast();
  const { projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<"" | TaskPriority>("");
  const [status, setStatus] = useState<"" | TaskStatus>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    if (!selectedProjectId && projects[0]) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId]
  );
  const permissions = useProjectPermissions(selectedProject);

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      priority: priority || undefined,
      status: status || undefined,
      limit: 100
    }),
    [debouncedSearch, priority, status]
  );

  const { tasks, total, isLoading, isMutating, createTask, updateTask, updateStatus, deleteTask } = useTasks({
    projectId: selectedProject?.id,
    filters
  });

  const openCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (input: Parameters<typeof createTask>[0]) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, input);
      } else {
        await createTask(input);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch {
      toast({ title: "Task was not saved", description: "Only admins can create tasks.", variant: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) {
      return;
    }

    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    } catch {
      toast({ title: "Task was not deleted", description: "Only admins can delete tasks.", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Tasks</h1>
          <p className="mt-1 text-sm text-muted">Move work across the board and keep ownership clear.</p>
        </div>
        {permissions.canCreateTask ? (
          <Button onClick={openCreate} disabled={!selectedProject}>
            <Plus className="h-4 w-4" />
            New task
          </Button>
        ) : null}
      </div>

      {selectedProject && !permissions.isAdmin ? (
        <ForbiddenNotice message="You can view project tasks and update tasks assigned to you. Project admins manage creation, assignment, and deletion." />
      ) : null}

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_160px_160px]">
          <label className="block">
            <span className="sr-only">Project</span>
            <select
              className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={selectedProject?.id ?? ""}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              disabled={projectsLoading}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3">
            <Search className="h-4 w-4 text-muted" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
              type="search"
            />
          </div>
          <select
            className="h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            value={priority}
            onChange={(event) => setPriority(event.target.value as "" | TaskPriority)}
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <select
            className="h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            value={status}
            onChange={(event) => setStatus(event.target.value as "" | TaskStatus)}
          >
            <option value="">All statuses</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Filter className="h-4 w-4" />
          {total} matching tasks
        </div>
      </Card>

      {!selectedProject ? (
        <Card className="p-8 text-center">
          <h2 className="text-base font-semibold text-ink">No project selected</h2>
          <p className="mt-2 text-sm text-muted">Create or select a project before managing tasks.</p>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-96 animate-pulse rounded-lg border border-border bg-white" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-base font-semibold text-ink">No tasks found</h2>
          <p className="mt-2 text-sm text-muted">Create a task or adjust the filters.</p>
          {permissions.canCreateTask ? (
            <Button className="mt-5" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New task
            </Button>
          ) : null}
        </Card>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={updateStatus}
          canMoveTask={permissions.canUpdateTask}
          canEditTask={permissions.canUpdateTask}
          canDeleteTask={permissions.canDeleteTask}
          onEdit={(task) => {
            setEditingTask(task);
            setIsModalOpen(true);
          }}
          onDelete={setDeletingTask}
        />
      )}

      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        members={selectedProject?.members}
        isSubmitting={isMutating}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        title="Delete task"
        description={`Delete ${deletingTask?.title ?? "this task"}?`}
        isSubmitting={isMutating}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
