import { apiClient, setAccessToken } from "./client";
import { ApiSuccess, SafeUser } from "../types";

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  async checkSetup(): Promise<boolean> {
    const { data } = await apiClient.get<ApiSuccess<{ setupRequired: boolean }>>("/auth/setup");
    return data.data.setupRequired;
  },

  async setup(payload: RegisterPayload) {
    const { data } = await apiClient.post<ApiSuccess<SafeUser>>("/auth/setup", payload);
    return data.data;
  },

  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<ApiSuccess<{ user: SafeUser; accessToken: string }>>(
      "/auth/login",
      payload
    );
    setAccessToken(data.data.accessToken);
    return data.data.user;
  },

  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<ApiSuccess<SafeUser>>("/auth/register", payload);
    return data.data;
  },

  async refresh() {
    const { data } = await apiClient.post<ApiSuccess<{ user: SafeUser; accessToken: string }>>(
      "/auth/refresh"
    );
    setAccessToken(data.data.accessToken);
    return data.data.user;
  },

  async logout() {
    await apiClient.post("/auth/logout");
    setAccessToken(null);
  },
};