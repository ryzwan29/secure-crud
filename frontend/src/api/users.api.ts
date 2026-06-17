import { apiClient } from "./client";
import { ApiSuccess, SafeUser, UserRole } from "../types";

export const usersApi = {
  async list() {
    const { data } = await apiClient.get<ApiSuccess<SafeUser[]>>("/users");
    return data.data;
  },

  async updateRole(id: number, role: UserRole) {
    const { data } = await apiClient.patch<ApiSuccess<SafeUser>>(`/users/${id}/role`, { role });
    return data.data;
  },

  async setActive(id: number, isActive: boolean) {
    const { data } = await apiClient.patch<ApiSuccess<SafeUser>>(`/users/${id}/active`, { isActive });
    return data.data;
  },
};
