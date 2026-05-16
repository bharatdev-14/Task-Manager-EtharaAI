"use client";

import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { Task, TaskStatus } from "@/types";
import { TaskCard } from "@/components/tasks/TaskCard";
import { cn } from "@/lib/utils";

const columns: Array<{ status: TaskStatus; label: string }> = [
  { status: "TODO", label: "Todo" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "DONE", label: "Done" }
];

function KanbanColumn({
  status,
  label,
  tasks,
  onEdit,
  onDelete,
  canMoveTask,
  canEditTask,
  canDeleteTask
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  canMoveTask: (task: Task) => boolean;
  canEditTask: (task: Task) => boolean;
  canDeleteTask: (task: Task) => boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn("min-h-[360px] rounded-lg border border-border bg-surface p-3", isOver && "border-brand-500 bg-brand-50")}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-sm font-semibold text-ink">{label}</h2>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-muted">{tasks.length}</span>
      </div>
      <div className="mt-3 space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-white p-4 text-center text-sm text-muted">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              canMove={canMoveTask(task)}
              canEdit={canEditTask(task)}
              canDelete={canDeleteTask(task)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}

type KanbanBoardProps = {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  canMoveTask: (task: Task) => boolean;
  canEditTask: (task: Task) => boolean;
  canDeleteTask: (task: Task) => boolean;
};

export function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete, canMoveTask, canEditTask, canDeleteTask }: KanbanBoardProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    const status = event.over?.id as TaskStatus | undefined;

    if (task && status && task.status !== status) {
      onStatusChange(task.id, status);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={tasks.filter((task) => task.status === column.status)}
            onEdit={onEdit}
            onDelete={onDelete}
            canMoveTask={canMoveTask}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
          />
        ))}
      </div>
    </DndContext>
  );
}
