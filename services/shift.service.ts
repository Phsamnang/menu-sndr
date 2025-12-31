import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Shift {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    fullName: string | null;
    role: {
      id: string;
      name: string;
      displayName: string;
    };
  };
  shiftDate: string;
  clockIn: string;
  clockOut: string | null;
  breakMinutes: number;
  totalHours: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  sessions?: any[];
}

export interface CreateShiftData {
  userId: string;
  shiftDate: string;
  clockIn: string;
  breakMinutes?: number;
  notes?: string;
}

export interface UpdateShiftData {
  clockOut?: string;
  breakMinutes?: number;
  status?: string;
  notes?: string;
  totalHours?: number;
}

export const shiftService = {
  getAll: async (filters?: {
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Shift[]> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await axiosInstance.get<ApiResponse<Shift[]>>(
      `/api/admin/shifts${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  getById: async (id: string): Promise<Shift> => {
    const response = await axiosInstance.get<ApiResponse<Shift>>(
      `/api/admin/shifts/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch shift");
    }
    return result.data;
  },

  create: async (data: CreateShiftData): Promise<Shift> => {
    const response = await axiosInstance.post<ApiResponse<Shift>>(
      "/api/admin/shifts",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create shift");
    }
    return result.data;
  },

  update: async (id: string, data: UpdateShiftData): Promise<Shift> => {
    const response = await axiosInstance.put<ApiResponse<Shift>>(
      `/api/admin/shifts/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update shift");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/shifts/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete shift");
    }
  },
};

