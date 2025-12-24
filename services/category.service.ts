import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Category {
  id: string;
  name: string;
  displayName: string;
}

const CategoryEndpoints = {
  BASE: "/api/admin/categories",
  getAll: () => CategoryEndpoints.BASE,
  getById: (id: string) => `${CategoryEndpoints.BASE}/${id}`,
  create: () => CategoryEndpoints.BASE,
  update: (id: string) => `${CategoryEndpoints.BASE}/${id}`,
  delete: (id: string) => `${CategoryEndpoints.BASE}/${id}`,
};

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await axiosInstance.get<ApiResponse<Category[]>>(
      CategoryEndpoints.getAll()
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch categories");
    }
    return result.data;
  },

  create: async (data: {
    name: string;
    displayName: string;
  }): Promise<Category> => {
    const response = await axiosInstance.post<ApiResponse<Category>>(
      CategoryEndpoints.create(),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create category");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: { name: string; displayName: string }
  ): Promise<Category> => {
    const response = await axiosInstance.put<ApiResponse<Category>>(
      CategoryEndpoints.update(id),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update category");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      CategoryEndpoints.delete(id)
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete category");
    }
  },
};
