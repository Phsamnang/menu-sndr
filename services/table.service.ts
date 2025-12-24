import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface TableType {
  id: string;
  name: string;
  displayName: string;
  order: number;
}

export interface TableItem {
  id: string;
  number: string;
  name: string | null;
  capacity: number;
  tableTypeId: string;
  status: string;
  tableType: TableType;
}

export const tableService = {
  getAll: async (): Promise<TableItem[]> => {
    const response = await axiosInstance.get<ApiResponse<TableItem[]>>(
      "/api/admin/tables"
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch tables");
    }
    return result.data;
  },

  create: async (data: {
    number: string;
    name: string;
    capacity: number;
    tableTypeId: string;
    status: string;
  }): Promise<TableItem> => {
    const response = await axiosInstance.post<ApiResponse<TableItem>>(
      "/api/admin/tables",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create table");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: {
      number?: string;
      name?: string;
      capacity?: number;
      tableTypeId?: string;
      status?: string;
    }
  ): Promise<TableItem> => {
    const response = await axiosInstance.put<ApiResponse<TableItem>>(
      `/api/admin/tables/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update table");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/tables/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete table");
    }
  },
};

