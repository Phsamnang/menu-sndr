import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
  description: string | null;
  isPublic: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

export interface CreateSettingData {
  key: string;
  value: string;
  type: string;
  category: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateSettingData {
  value?: string;
  type?: string;
  category?: string;
  description?: string;
  isPublic?: boolean;
}

export const settingsService = {
  getAll: async (filters?: {
    category?: string;
    isPublic?: boolean;
  }): Promise<Setting[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.isPublic !== undefined)
      params.append("isPublic", filters.isPublic.toString());

    const response = await axiosInstance.get<ApiResponse<Setting[]>>(
      `/api/admin/settings${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  getById: async (id: string): Promise<Setting> => {
    const response = await axiosInstance.get<ApiResponse<Setting>>(
      `/api/admin/settings/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch setting");
    }
    return result.data;
  },

  create: async (data: CreateSettingData): Promise<Setting> => {
    const response = await axiosInstance.post<ApiResponse<Setting>>(
      "/api/admin/settings",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create setting");
    }
    return result.data;
  },

  update: async (id: string, data: UpdateSettingData): Promise<Setting> => {
    const response = await axiosInstance.put<ApiResponse<Setting>>(
      `/api/admin/settings/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update setting");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/settings/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete setting");
    }
  },
};

