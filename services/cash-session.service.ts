import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface CashSession {
  id: string;
  shiftId: string | null;
  shift: {
    id: string;
    user: {
      id: string;
      username: string;
      fullName: string | null;
    };
  } | null;
  userId: string;
  sessionNumber: string;
  openingBalance: number;
  closingBalance: number | null;
  expectedBalance: number | null;
  variance: number | null;
  totalSales: number;
  totalRefunds: number;
  totalExpenses: number;
  status: string;
  openedAt: string;
  closedAt: string | null;
  notes: string | null;
}

export interface CreateCashSessionData {
  shiftId?: string;
  userId: string;
  openingBalance: number;
  sessionNumber?: string;
}

export interface UpdateCashSessionData {
  closingBalance?: number;
  expectedBalance?: number;
  totalSales?: number;
  totalRefunds?: number;
  totalExpenses?: number;
  status?: string;
  notes?: string;
}

export const cashSessionService = {
  getAll: async (filters?: {
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CashSession[]> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await axiosInstance.get<ApiResponse<CashSession[]>>(
      `/api/admin/cash-sessions${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  getById: async (id: string): Promise<CashSession> => {
    const response = await axiosInstance.get<ApiResponse<CashSession>>(
      `/api/admin/cash-sessions/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch cash session");
    }
    return result.data;
  },

  create: async (data: CreateCashSessionData): Promise<CashSession> => {
    const response = await axiosInstance.post<ApiResponse<CashSession>>(
      "/api/admin/cash-sessions",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create cash session");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: UpdateCashSessionData
  ): Promise<CashSession> => {
    const response = await axiosInstance.put<ApiResponse<CashSession>>(
      `/api/admin/cash-sessions/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update cash session");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/cash-sessions/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete cash session");
    }
  },
};

