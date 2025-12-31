import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  applicableDays: string | null;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionData {
  name: string;
  description?: string;
  code?: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  applicableDays?: string[];
  usageLimit?: number;
}

export interface UpdatePromotionData {
  name?: string;
  description?: string;
  code?: string;
  type?: string;
  value?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  applicableDays?: string[];
  usageLimit?: number;
  isActive?: boolean;
}

export const promotionService = {
  getAll: async (filters?: {
    isActive?: boolean;
    type?: string;
  }): Promise<Promotion[]> => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());
    if (filters?.type) params.append("type", filters.type);

    const response = await axiosInstance.get<ApiResponse<Promotion[]>>(
      `/api/admin/promotions${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  getById: async (id: string): Promise<Promotion> => {
    const response = await axiosInstance.get<ApiResponse<Promotion>>(
      `/api/admin/promotions/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch promotion");
    }
    return result.data;
  },

  create: async (data: CreatePromotionData): Promise<Promotion> => {
    const response = await axiosInstance.post<ApiResponse<Promotion>>(
      "/api/admin/promotions",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create promotion");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: UpdatePromotionData
  ): Promise<Promotion> => {
    const response = await axiosInstance.put<ApiResponse<Promotion>>(
      `/api/admin/promotions/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update promotion");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/promotions/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete promotion");
    }
  },
};

