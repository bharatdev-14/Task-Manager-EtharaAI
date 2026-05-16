export type ProjectRole = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export type ProjectMember = {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  user: User;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  admin: Pick<User, "id" | "name" | "email">;
  members?: ProjectMember[];
  tasks?: Task[];
  createdAt: string;
  _count?: {
    tasks: number;
  };
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: string;
  project?: Pick<Project, "id" | "name">;
  assignedTo?: Pick<User, "id" | "name" | "email">;
  createdBy?: Pick<User, "id" | "name" | "email">;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

export type DashboardAnalytics = {
  totals: {
    projects: number;
    tasks: number;
    assignedToMe: number;
    overdue: number;
    completed: number;
  };
  tasksByStatus: Array<{ status: TaskStatus; count: number }>;
  tasksPerUser: Array<{ userId: string; name: string; email: string; tasks: number }>;
  overdueTasks: Task[];
  recentActivity: Task[];
};
