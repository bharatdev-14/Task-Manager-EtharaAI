"use client";

import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListChecks } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { TaskStatus } from "@/types";

const statusLabels: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  DONE: "Done"
};

const statusColors: Record<TaskStatus, string> = {
  TODO: "#0ea5e9",
  IN_PROGRESS: "#f59e0b",
  DONE: "#10b981"
};

function SkeletonCard() {
  return <div className="h-32 animate-pulse rounded-lg border border-border bg-white" />;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No date";
  }

  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Loading delivery analytics.</p>
        </div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </section>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg border border-border bg-white" />
          <div className="h-80 animate-pulse rounded-lg border border-border bg-white" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold text-ink">No analytics available</h1>
        <p className="mt-2 text-sm text-muted">Create a project and tasks to populate the dashboard.</p>
      </Card>
    );
  }

  const completionRate = data.totals.tasks ? Math.round((data.totals.completed / data.totals.tasks) * 100) : 0;
  const stats = [
    { label: "Projects", value: data.totals.projects, detail: "active workspaces", icon: FolderKanban },
    { label: "Total tasks", value: data.totals.tasks, detail: `${data.totals.assignedToMe} assigned to you`, icon: ListChecks },
    { label: "Completed", value: data.totals.completed, detail: `${completionRate}% completion rate`, icon: CheckCircle2 },
    { label: "Overdue", value: data.totals.overdue, detail: "need attention", icon: AlertTriangle }
  ];

  const statusChartData = data.tasksByStatus.map((item) => ({
    name: statusLabels[item.status],
    value: item.count,
    status: item.status
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Track delivery health, workload, and recent task movement.</p>
        </div>
        <Card className="px-4 py-3">
          <p className="text-xs uppercase text-muted">Productivity overview</p>
          <p className="mt-1 text-lg font-semibold text-ink">{completionRate}% complete</p>
        </Card>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted">{stat.detail}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-ink">Tasks by status</h2>
          <div className="mt-5 h-72">
            {data.totals.tasks === 0 ? (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted">
                No task data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.status} fill={statusColors[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-ink">Tasks per user</h2>
          <div className="mt-5 h-72">
            {data.tasksPerUser.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted">
                No assignee data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tasksPerUser}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-base font-semibold text-ink">Overdue alerts</h2>
          </div>
          <div className="mt-4 space-y-3">
            {data.overdueTasks.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted">
                Nothing overdue. Nice and tidy.
              </div>
            ) : (
              data.overdueTasks.map((task) => (
                <div key={task.id} className="rounded-md border border-red-100 bg-red-50 p-3">
                  <p className="text-sm font-semibold text-red-900">{task.title}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-red-700">
                    <span>{task.project?.name}</span>
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-brand-700" />
            <h2 className="text-base font-semibold text-ink">Recent tasks</h2>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentActivity.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted">
                Recent task updates will appear here.
              </div>
            ) : (
              data.recentActivity.map((task) => (
                <div key={task.id} className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium text-ink">{task.title}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <span>{task.project?.name}</span>
                    <span>{statusLabels[task.status]}</span>
                    <span>{formatDate(task.updatedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
