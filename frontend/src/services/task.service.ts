import { api } from "@/lib/api";
import { ApiResponse, Task, TaskPriority, TaskStatus } from "@/types";

export type TaskFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  due?: "overdue" | "today" | "upcoming";
};

export type TaskInput = {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string | null;
};

const params = (filters?: TaskFilters) => ({
  params: Object.fromEntries(Object.entries(filters ?? {}).filter(([, value]) => value !== undefined && value !== ""))
});

export const taskService = {
  async listMine(filters?: TaskFilters) {
    const response = await api.get<ApiResponse<Task[]>>("/tasks", params(filters));
    return response.data;
  },

  async listProject(projectId: string, filters?: TaskFilters) {
    const response = await api.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`, params(filters));
    return response.data;
  },

  async get(id: string) {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  async create(projectId: string, input: TaskInput) {
    const response = await api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, input);
    return response.data.data;
  },

  async update(id: string, input: TaskInput) {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, input);
    return response.data.data;
  },

  async remove(id: string) {
    await api.delete<ApiResponse<null>>(`/tasks/${id}`);
  },

  async assign(id: string, assignedToId: string | null) {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/assign`, { assignedToId });
    return response.data.data;
  },

  async updateStatus(id: string, status: TaskStatus) {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return response.data.data;
  }
};
