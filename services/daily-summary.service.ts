import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface DailySummary {
  id: string;
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  avgOrderValue: number;
  topMenuItem: string | null;
  topCategory: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailySummaryData {
  date: string;
}

export const dailySummaryService = {
  getAll: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DailySummary[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await axiosInstance.get<ApiResponse<{ items: DailySummary[]; total: number }>>(
      `/api/admin/daily-summaries${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data.items;
  },

  create: async (data: CreateDailySummaryData): Promise<DailySummary> => {
    const response = await axiosInstance.post<ApiResponse<DailySummary>>(
      "/api/admin/daily-summaries",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create daily summary");
    }
    return result.data;
  },
};

