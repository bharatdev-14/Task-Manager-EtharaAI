"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Pencil, Plus, Trash2, UserMinus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ForbiddenNotice } from "@/components/auth/ForbiddenNotice";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/ToastProvider";
import { useProjectPermissions } from "@/hooks/usePermissions";
import { useProject } from "@/hooks/useProject";
import { projectService } from "@/services/project.service";
import { ProjectMember } from "@/types";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { project, isLoading, isMutating, updateProject, addMember, removeMember } = useProject(params.id);
  const permissions = useProjectPermissions(project);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const openEdit = () => {
    if (!project) {
      return;
    }

    setEditName(project.name);
    setEditDescription(project.description ?? "");
    setIsEditOpen(true);
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editName.trim().length < 2) {
      toast({ title: "Project name is too short", variant: "error" });
      return;
    }

    try {
      await updateProject({
        name: editName.trim(),
        description: editDescription.trim() || null
      });
      setIsEditOpen(false);
    } catch {
      toast({ title: "Project was not updated", description: "Only admins can update projects.", variant: "error" });
    }
  };

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!memberEmail.includes("@")) {
      toast({ title: "Enter a valid email", variant: "error" });
      return;
    }

    try {
      await addMember({ email: memberEmail.trim(), role: memberRole });
      setMemberEmail("");
      setMemberRole("MEMBER");
      setIsAddMemberOpen(false);
    } catch {
      toast({
        title: "Member was not added",
        description: "Confirm the user exists and is not already a member.",
        variant: "error"
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) {
      return;
    }

    try {
      await removeMember(memberToRemove.id);
      setMemberToRemove(null);
    } catch {
      toast({ title: "Member was not removed", description: "Project admins cannot be removed.", variant: "error" });
    }
  };

  const handleDeleteProject = async () => {
    if (!project) {
      return;
    }

    try {
      await projectService.remove(project.id);
      toast({ title: "Project deleted", description: project.name, variant: "success" });
      router.push("/dashboard/projects");
    } catch {
      toast({ title: "Project was not deleted", description: "Only admins can delete projects.", variant: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-brand-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold text-ink">Project not found</h1>
        <Link href="/dashboard/projects">
          <Button className="mt-5" variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <Link href="/dashboard/projects" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
          <h1 className="text-2xl font-semibold text-ink">{project.name}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">{project.description || "No description yet."}</p>
        </div>
        {permissions.isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={openEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button onClick={() => setIsAddMemberOpen(true)}>
              <Plus className="h-4 w-4" />
              Add member
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {!permissions.isAdmin ? (
        <ForbiddenNotice message="You can view this project. Only project admins can edit project details, manage members, or delete the project." />
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Users className="h-4 w-4" />
            Members
          </div>
          <p className="mt-3 text-3xl font-semibold text-ink">{project.members?.length ?? 0}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted">
            <CalendarDays className="h-4 w-4" />
            Tasks
          </div>
          <p className="mt-3 text-3xl font-semibold text-ink">{project.tasks?.length ?? project._count?.tasks ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Admin</p>
          <p className="mt-3 text-base font-semibold text-ink">{project.admin.name}</p>
          <p className="mt-1 text-sm text-muted">{project.admin.email}</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Members</h2>
              <p className="mt-1 text-sm text-muted">Admins can invite and remove project members.</p>
            </div>
            {permissions.isAdmin ? (
              <Button variant="secondary" onClick={() => setIsAddMemberOpen(true)}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            ) : null}
          </div>
          <div className="mt-5 space-y-3">
            {project.members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{member.user.name}</p>
                  <p className="truncate text-xs text-muted">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-muted">{member.role}</span>
                  {permissions.isAdmin && member.userId !== project.admin.id ? (
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-red-50 hover:text-red-700"
                      onClick={() => setMemberToRemove(member)}
                      aria-label={`Remove ${member.user.name}`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-ink">Task board</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => (
              <div key={status} className="min-h-52 rounded-md border border-border bg-surface p-3">
                <h3 className="text-xs font-semibold uppercase text-muted">{status.replace("_", " ")}</h3>
                <div className="mt-3 space-y-3">
                  {project.tasks?.filter((task) => task.status === status).map((task) => (
                    <div key={task.id} className="rounded-md border border-border bg-white p-3">
                      <p className="text-sm font-medium text-ink">{task.title}</p>
                      <p className="mt-2 text-xs text-muted">{task.priority}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit project">
        <form className="space-y-4" onSubmit={handleUpdate}>
          <label className="block">
            <span className="text-sm font-medium text-ink">Name</span>
            <input
              className="mt-1 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Description</span>
            <textarea
              className="mt-1 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Add member">
        <form className="space-y-4" onSubmit={handleAddMember}>
          <label className="block">
            <span className="text-sm font-medium text-ink">User email</span>
            <input
              className="mt-1 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={memberEmail}
              onChange={(event) => setMemberEmail(event.target.value)}
              type="email"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Role</span>
            <select
              className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={memberRole}
              onChange={(event) => setMemberRole(event.target.value as "ADMIN" | "MEMBER")}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? "Adding..." : "Add member"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        title="Remove member"
        description={`Remove ${memberToRemove?.user.name ?? "this member"} from the project?`}
        confirmLabel="Remove"
        isSubmitting={isMutating}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete project"
        description={`Delete ${project.name} and all related tasks?`}
        isSubmitting={isMutating}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
}
