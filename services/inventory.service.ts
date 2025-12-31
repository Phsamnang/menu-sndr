import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Inventory {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    unit?: {
      id: string;
      name: string;
      displayName: string;
      symbol?: string;
    };
  };
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  unitId: string;
  unit?: {
    id: string;
    name: string;
    displayName: string;
    symbol?: string;
  };
  averageCost: number;
  lastRestocked?: string;
  lastStockCheck?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  lowStock?: boolean;
}

const InventoryEndpoints = {
  BASE: "/api/admin/inventory",
  getAll: () => InventoryEndpoints.BASE,
  getById: (id: string) => `${InventoryEndpoints.BASE}/${id}`,
  create: () => InventoryEndpoints.BASE,
  update: (id: string) => `${InventoryEndpoints.BASE}/${id}`,
  delete: (id: string) => `${InventoryEndpoints.BASE}/${id}`,
};

export const inventoryService = {
  getAll: async (
    filters?: InventoryFilters
  ): Promise<{
    items: Inventory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.lowStock) params.append("lowStock", "true");

    const url = params.toString()
      ? `${InventoryEndpoints.getAll()}?${params.toString()}`
      : InventoryEndpoints.getAll();

    const response = await axiosInstance.get<
      ApiResponse<{
        items: Inventory[];
        pagination: any;
      }>
    >(url);
    const result = response.data;
    if (!result.success || !result.data) {
      return {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
    return result.data;
  },

  getById: async (id: string): Promise<Inventory> => {
    const response = await axiosInstance.get<ApiResponse<Inventory>>(
      InventoryEndpoints.getById(id)
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch inventory");
    }
    return result.data;
  },

  create: async (data: {
    productId: string;
    currentStock?: number;
    minStockLevel?: number;
    maxStockLevel?: number;
    unitId: string;
    averageCost?: number;
  }): Promise<Inventory> => {
    const response = await axiosInstance.post<ApiResponse<Inventory>>(
      InventoryEndpoints.create(),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create inventory");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: {
      currentStock?: number;
      minStockLevel?: number;
      maxStockLevel?: number;
      unitId?: string;
      averageCost?: number;
      lastStockCheck?: string;
    }
  ): Promise<Inventory> => {
    const response = await axiosInstance.put<ApiResponse<Inventory>>(
      InventoryEndpoints.update(id),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update inventory");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      InventoryEndpoints.delete(id)
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete inventory");
    }
  },
};

