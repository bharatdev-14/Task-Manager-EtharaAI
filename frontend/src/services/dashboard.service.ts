import { api } from "@/lib/api";
import { ApiResponse, DashboardAnalytics, Task } from "@/types";

export const dashboardService = {
  async overview() {
    const response = await api.get<ApiResponse<DashboardAnalytics>>("/dashboard");
    return response.data.data;
  },

  async totalTasks() {
    const response = await api.get<ApiResponse<{ total: number; completed: number; open: number }>>(
      "/dashboard/total-tasks"
    );
    return response.data.data;
  },

  async overdueTasks() {
    const response = await api.get<ApiResponse<Task[]>>("/dashboard/overdue-tasks");
    return response.data.data;
  }
};
