import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Role {
  id: string;
  name: string;
  displayName: string;
}

export interface User {
  id: string;
  username: string;
  roleId: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>(
      "/api/admin/users"
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch users");
    }
    return result.data;
  },

  create: async (data: {
    username: string;
    password: string;
    roleId: string;
    isActive: boolean;
  }): Promise<User> => {
    const response = await axiosInstance.post<ApiResponse<User>>(
      "/api/admin/users",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create user");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: {
      username?: string;
      password?: string;
      roleId?: string;
      isActive?: boolean;
    }
  ): Promise<User> => {
    const response = await axiosInstance.put<ApiResponse<User>>(
      `/api/admin/users/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update user");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/users/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete user");
    }
  },
};

export const roleService = {
  getAll: async (): Promise<Role[]> => {
    const response = await axiosInstance.get<ApiResponse<Role[]>>(
      "/api/admin/roles"
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },
};
