import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Unit {
  id: string;
  name: string;
  displayName: string;
  symbol: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitData {
  name: string;
  displayName: string;
  symbol?: string;
  order?: number;
}

export interface UpdateUnitData {
  name?: string;
  displayName?: string;
  symbol?: string;
  order?: number;
  isActive?: boolean;
}

export const unitService = {
  getAll: async (): Promise<Unit[]> => {
    const response = await axiosInstance.get<ApiResponse<Unit[]>>(
      "/api/admin/units"
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  getById: async (id: string): Promise<Unit> => {
    const response = await axiosInstance.get<ApiResponse<Unit>>(
      `/api/admin/units/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch unit");
    }
    return result.data;
  },

  create: async (data: CreateUnitData): Promise<Unit> => {
    const response = await axiosInstance.post<ApiResponse<Unit>>(
      "/api/admin/units",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create unit");
    }
    return result.data;
  },

  update: async (id: string, data: UpdateUnitData): Promise<Unit> => {
    const response = await axiosInstance.put<ApiResponse<Unit>>(
      `/api/admin/units/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update unit");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/units/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete unit");
    }
  },
};

