import { api } from "@/lib/api";
import { ApiResponse, User } from "@/types";

export type AuthResponse = {
  user: User;
  token: string;
  refreshToken?: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export const authService = {
  async signup(input: SignupInput) {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/signup", input);
    return response.data.data;
  },

  async login(input: LoginInput) {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", input);
    return response.data.data;
  },

  async me() {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  }
};
