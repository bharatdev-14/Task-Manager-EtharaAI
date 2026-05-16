"use client";

import { CSSProperties, memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CalendarDays, GripVertical, Pencil, Trash2, User } from "lucide-react";
import { Task, TaskPriority } from "@/types";
import { cn } from "@/lib/utils";

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-red-50 text-red-700"
};

function dueState(dueDate?: string | null) {
  if (!dueDate) {
    return { label: "No date", className: "text-muted" };
  }

  const due = new Date(dueDate);
  const today = new Date();
  const isOverdue = due.getTime() < today.setHours(0, 0, 0, 0);

  return {
    label: due.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    className: isOverdue ? "text-red-700" : "text-muted"
  };
}

type TaskCardProps = {
  task: Task;
  canMove?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

function TaskCardComponent({ task, canMove, canEdit, canDelete, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !canMove,
    data: {
      task
    }
  });
  const due = dueState(task.dueDate);
  const style: CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn("rounded-lg border border-border bg-white p-4 shadow-sm", isDragging && "z-30 opacity-80 shadow-soft")}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className={cn(
            "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface",
            canMove ? "cursor-grab" : "cursor-not-allowed opacity-40"
          )}
          aria-label={`Drag ${task.title}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-ink">{task.title}</h3>
          {task.description ? <p className="mt-2 line-clamp-2 text-xs text-muted">{task.description}</p> : null}
        </div>
        <div className="flex shrink-0 gap-1">
          {canEdit ? (
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink"
              onClick={() => onEdit(task)}
              aria-label={`Edit ${task.title}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(task)}
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className={cn("rounded-md px-2 py-1 font-medium", priorityStyles[task.priority])}>{task.priority}</span>
        <span className={cn("inline-flex items-center gap-1", due.className)}>
          <CalendarDays className="h-3.5 w-3.5" />
          {due.label}
        </span>
        {task.assignedTo ? (
          <span className="inline-flex items-center gap-1 text-muted">
            <User className="h-3.5 w-3.5" />
            {task.assignedTo.name}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);
