import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface TableType {
  id: string;
  name: string;
  displayName: string;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
}

export interface Price {
  id?: string;
  tableTypeId: string;
  tableTypeName?: string;
  amount: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  categoryName?: string;
  isCook?: boolean;
  prices: Price[];
}

export interface PaginatedResponse {
  items: MenuItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MenuItemFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

const MenuItemEndpoints = {
  BASE: "/api/admin/menu-items",
  getAll: () => MenuItemEndpoints.BASE,
  getById: (id: string) => `${MenuItemEndpoints.BASE}/${id}`,
  create: () => MenuItemEndpoints.BASE,
  update: (id: string) => `${MenuItemEndpoints.BASE}/${id}`,
  delete: (id: string) => `${MenuItemEndpoints.BASE}/${id}`,
};

export const menuItemService = {
  getAll: async (filters?: MenuItemFilters): Promise<PaginatedResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.search) params.append("search", filters.search);

    const url = params.toString()
      ? `${MenuItemEndpoints.getAll()}?${params.toString()}`
      : MenuItemEndpoints.getAll();

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse>>(
      url
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch menu items");
    }
    return result.data;
  },

  getById: async (id: string): Promise<MenuItem> => {
    const response = await axiosInstance.get<ApiResponse<MenuItem>>(
      MenuItemEndpoints.getById(id)
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch menu item");
    }
    return result.data;
  },

  create: async (data: {
    name: string;
    description: string;
    image: string;
    categoryId: string;
    isCook: boolean;
    prices: Price[];
  }): Promise<MenuItem> => {
    const response = await axiosInstance.post<ApiResponse<MenuItem>>(
      MenuItemEndpoints.create(),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create menu item");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      image?: string;
      categoryId?: string;
      isCook?: boolean;
      prices?: Price[];
    }
  ): Promise<MenuItem> => {
    const response = await axiosInstance.put<ApiResponse<MenuItem>>(
      MenuItemEndpoints.update(id),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update menu item");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      MenuItemEndpoints.delete(id)
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete menu item");
    }
  },
};
