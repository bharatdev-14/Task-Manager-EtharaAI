import { api } from "@/lib/api";
import { ApiResponse, Project, ProjectMember, ProjectRole } from "@/types";

export type CreateProjectInput = {
  name: string;
  description?: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
};

export type AddMemberInput = {
  email: string;
  role: ProjectRole;
};

export const projectService = {
  async list() {
    const response = await api.get<ApiResponse<Project[]>>("/projects");
    return response.data.data;
  },

  async get(id: string) {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  async create(input: CreateProjectInput) {
    const response = await api.post<ApiResponse<Project>>("/projects", input);
    return response.data.data;
  },

  async update(id: string, input: UpdateProjectInput) {
    const response = await api.patch<ApiResponse<Project>>(`/projects/${id}`, input);
    return response.data.data;
  },

  async remove(id: string) {
    await api.delete<ApiResponse<null>>(`/projects/${id}`);
  },

  async addMember(projectId: string, input: AddMemberInput) {
    const response = await api.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, input);
    return response.data.data;
  },

  async removeMember(projectId: string, memberId: string) {
    await api.delete<ApiResponse<null>>(`/projects/${projectId}/members/${memberId}`);
  }
};
