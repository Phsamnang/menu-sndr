import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface StockMovement {
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
    };
  };
  type: string; // IN, OUT, ADJUSTMENT, WASTE, RETURN
  quantity: number;
  unitId: string;
  unit?: {
    id: string;
    name: string;
    displayName: string;
    symbol?: string;
  };
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  reference?: string;
  notes?: string;
  performedBy?: string;
  createdAt: string;
}

export interface StockMovementFilters {
  page?: number;
  limit?: number;
  productId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

const StockMovementEndpoints = {
  BASE: "/api/admin/stock-movements",
  getAll: () => StockMovementEndpoints.BASE,
  getById: (id: string) => `${StockMovementEndpoints.BASE}/${id}`,
  create: () => StockMovementEndpoints.BASE,
};

export const stockMovementService = {
  getAll: async (
    filters?: StockMovementFilters
  ): Promise<{
    items: StockMovement[];
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
    if (filters?.productId) params.append("productId", filters.productId);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const url = params.toString()
      ? `${StockMovementEndpoints.getAll()}?${params.toString()}`
      : StockMovementEndpoints.getAll();

    const response = await axiosInstance.get<
      ApiResponse<{
        items: StockMovement[];
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

  getById: async (id: string): Promise<StockMovement> => {
    const response = await axiosInstance.get<ApiResponse<StockMovement>>(
      StockMovementEndpoints.getById(id)
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch stock movement");
    }
    return result.data;
  },

  create: async (data: {
    productId: string;
    type: string;
    quantity: number;
    unitId: string;
    unitCost?: number;
    reason?: string;
    reference?: string;
    notes?: string;
  }): Promise<StockMovement> => {
    const response = await axiosInstance.post<ApiResponse<StockMovement>>(
      StockMovementEndpoints.create(),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create stock movement");
    }
    return result.data;
  },
};

