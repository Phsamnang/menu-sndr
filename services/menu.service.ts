import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: "food" | "drink";
  prices: {
    [tableType: string]: number;
  };
}

export const menuService = {
  getAll: async (params?: {
    category?: string;
    tableType?: string;
  }): Promise<MenuItem[]> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.tableType) queryParams.append("tableType", params.tableType);

    const url = queryParams.toString()
      ? `/api/menu?${queryParams.toString()}`
      : "/api/menu";

    const response = await axiosInstance.get<ApiResponse<MenuItem[]>>(url, {
      requireAuth: false,
    } as any);
    const result = response.data;

    if (!result.success || !result.data) {
      const errorMessage =
        result.error?.message || result.error || "Failed to fetch menu";
      throw new Error(errorMessage);
    }

    return result.data;
  },
};

