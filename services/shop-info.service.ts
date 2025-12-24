import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface ShopInfo {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  taxId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const shopInfoService = {
  get: async (): Promise<ShopInfo | null> => {
    const response = await axiosInstance.get<ApiResponse<ShopInfo>>(
      "/api/admin/shop-info"
    );
    const result = response.data;
    if (!result.success) {
      return null;
    }
    return result.data || null;
  },

  update: async (data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    taxId?: string;
  }): Promise<ShopInfo> => {
    const response = await axiosInstance.put<ApiResponse<ShopInfo>>(
      "/api/admin/shop-info",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update shop info");
    }
    return result.data;
  },
};

