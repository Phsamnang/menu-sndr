import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface TableType {
  id: string;
  name: string;
  displayName: string;
  order: number;
}

export const tableTypeService = {
  getAll: async (requireAuth: boolean = true): Promise<TableType[]> => {
    const response = await axiosInstance.get<ApiResponse<TableType[]>>(
      "/api/admin/table-types",
      { requireAuth } as any
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch table types");
    }
    return result.data;
  },

  create: async (data: {
    name: string;
    displayName: string;
    order: number;
  }): Promise<TableType> => {
    const response = await axiosInstance.post<ApiResponse<TableType>>(
      "/api/admin/table-types",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create table type");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: { name: string; displayName: string; order: number }
  ): Promise<TableType> => {
    const response = await axiosInstance.put<ApiResponse<TableType>>(
      `/api/admin/table-types/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update table type");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/table-types/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete table type");
    }
  },
};
