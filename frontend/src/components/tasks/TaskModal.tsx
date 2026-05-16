"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProjectMember, Task, TaskPriority, TaskStatus } from "@/types";
import { TaskInput } from "@/services/task.service";

type TaskModalProps = {
  isOpen: boolean;
  task?: Task | null;
  members?: ProjectMember[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<void>;
};

export function TaskModal({ isOpen, task, members = [], isSubmitting, onClose, onSubmit }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [assignedToId, setAssignedToId] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : "");
    setPriority(task?.priority ?? "MEDIUM");
    setStatus(task?.status ?? "TODO");
    setAssignedToId(task?.assignedTo?.id ?? "");
  }, [isOpen, task]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      dueDate: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : null,
      priority,
      status,
      assignedToId: assignedToId || null
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Edit task" : "Create task"}
      description="Keep the work specific, assigned, and visible."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-ink">Title</span>
          <input
            className="mt-1 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={160}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Description</span>
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">Due date</span>
            <input
              className="mt-1 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              type="date"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Assignee</span>
            <select
              className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={assignedToId}
              onChange={(event) => setAssignedToId(event.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.userId}>
                  {member.user.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">Priority</span>
            <select
              className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Status</span>
            <select
              className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || title.trim().length < 2}>
            {isSubmitting ? "Saving..." : task ? "Save task" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
