import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface RecipeItem {
  id: string;
  menuItemId: string;
  menuItem: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
      displayName: string;
    };
  };
  productId: string;
  product: {
    id: string;
    name: string;
    baseUnit: {
      id: string;
      name: string;
      displayName: string;
      symbol: string | null;
    } | null;
  };
  quantity: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeItemData {
  menuItemId: string;
  productId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateRecipeItemData {
  quantity?: number;
  notes?: string;
}

export const recipeItemService = {
  getAll: async (filters?: {
    menuItemId?: string;
    productId?: string;
  }): Promise<RecipeItem[]> => {
    const params = new URLSearchParams();
    if (filters?.menuItemId) params.append("menuItemId", filters.menuItemId);
    if (filters?.productId) params.append("productId", filters.productId);

    const response = await axiosInstance.get<ApiResponse<RecipeItem[]>>(
      `/api/admin/recipe-items${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  getById: async (id: string): Promise<RecipeItem> => {
    const response = await axiosInstance.get<ApiResponse<RecipeItem>>(
      `/api/admin/recipe-items/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch recipe item");
    }
    return result.data;
  },

  create: async (data: CreateRecipeItemData): Promise<RecipeItem> => {
    const response = await axiosInstance.post<ApiResponse<RecipeItem>>(
      "/api/admin/recipe-items",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create recipe item");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: UpdateRecipeItemData
  ): Promise<RecipeItem> => {
    const response = await axiosInstance.put<ApiResponse<RecipeItem>>(
      `/api/admin/recipe-items/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update recipe item");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/recipe-items/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete recipe item");
    }
  },
};

