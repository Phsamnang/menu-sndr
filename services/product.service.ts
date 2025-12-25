import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  unitId: string | null;
  unit: {
    id: string;
    name: string;
    displayName: string;
    symbol: string | null;
  } | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  unitId?: string;
  category?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  unitId?: string;
  category?: string;
  isActive?: boolean;
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      "/api/admin/products"
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get<ApiResponse<Product>>(
      `/api/admin/products/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch product");
    }
    return result.data;
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const response = await axiosInstance.post<ApiResponse<Product>>(
      "/api/admin/products",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create product");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: UpdateProductData
  ): Promise<Product> => {
    const response = await axiosInstance.put<ApiResponse<Product>>(
      `/api/admin/products/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update product");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/products/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete product");
    }
  },
};

