import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  menuItem: {
    id: string;
    name: string;
    image: string;
    category: {
      displayName: string;
    };
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId: string | null;
  customerName: string | null;
  status: string;
  discountType: string | null;
  discountValue: number | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  items: OrderItem[];
  createdAt?: string;
  table?: {
    id: string;
    number: string;
    name: string | null;
    tableType: {
      displayName: string;
    };
  };
}

export interface OrderFilters {
  status?: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderData {
  tableId: string;
  customerName: string | null;
  items: Array<{ menuItemId: string; quantity: number }>;
  discountType: string | null;
  discountValue: number;
}

export const orderService = {
  getAll: async (filters?: OrderFilters): Promise<{ items: Order[] }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const url = params.toString()
      ? `/api/admin/orders?${params.toString()}`
      : "/api/admin/orders";

    const response = await axiosInstance.get<ApiResponse<{ items: Order[] }>>(
      url
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return { items: [] };
    }
    return result.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await axiosInstance.get<ApiResponse<Order>>(
      `/api/admin/orders/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch order");
    }
    return result.data;
  },

  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await axiosInstance.post<ApiResponse<Order>>(
      "/api/admin/orders",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create order");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: {
      discountType?: string | null;
      discountValue?: number;
      customerName?: string | null;
      status?: string;
    }
  ): Promise<Order> => {
    const response = await axiosInstance.put<ApiResponse<Order>>(
      `/api/admin/orders/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update order");
    }
    return result.data;
  },

  addItem: async (
    orderId: string,
    data: { menuItemId: string; quantity: number }
  ): Promise<Order> => {
    const response = await axiosInstance.post<ApiResponse<Order>>(
      `/api/admin/orders/${orderId}/items`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to add item");
    }
    return result.data;
  },

  updateItem: async (
    orderId: string,
    data: { itemId: string; quantity: number }
  ): Promise<Order> => {
    const response = await axiosInstance.put<ApiResponse<Order>>(
      `/api/admin/orders/${orderId}/items`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update item");
    }
    return result.data;
  },

  deleteItem: async (orderId: string, itemId: string): Promise<Order> => {
    const response = await axiosInstance.delete<ApiResponse<Order>>(
      `/api/admin/orders/${orderId}/items?itemId=${itemId}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to delete item");
    }
    return result.data;
  },

  updateItemStatus: async (
    orderId: string,
    itemId: string,
    status: string
  ): Promise<void> => {
    const response = await axiosInstance.put<ApiResponse>(
      `/api/admin/orders/${orderId}/items/${itemId}/status`,
      { status }
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to update item status");
    }
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/orders/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete order");
    }
  },
};
