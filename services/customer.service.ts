import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  address?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  isVip: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  isVip?: boolean;
}

const CustomerEndpoints = {
  BASE: "/api/admin/customers",
  getAll: () => CustomerEndpoints.BASE,
  getById: (id: string) => `${CustomerEndpoints.BASE}/${id}`,
  create: () => CustomerEndpoints.BASE,
  update: (id: string) => `${CustomerEndpoints.BASE}/${id}`,
  delete: (id: string) => `${CustomerEndpoints.BASE}/${id}`,
};

export const customerService = {
  getAll: async (
    filters?: CustomerFilters
  ): Promise<{
    items: Customer[];
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
    if (filters?.isVip !== undefined)
      params.append("isVip", filters.isVip.toString());

    const url = params.toString()
      ? `${CustomerEndpoints.getAll()}?${params.toString()}`
      : CustomerEndpoints.getAll();

    const response = await axiosInstance.get<
      ApiResponse<{
        items: Customer[];
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

  getById: async (id: string): Promise<Customer> => {
    const response = await axiosInstance.get<ApiResponse<Customer>>(
      CustomerEndpoints.getById(id)
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch customer");
    }
    return result.data;
  },

  create: async (data: {
    name: string;
    phone: string;
    email?: string;
    birthday?: string;
    address?: string;
    notes?: string;
    isVip?: boolean;
  }): Promise<Customer> => {
    const response = await axiosInstance.post<ApiResponse<Customer>>(
      CustomerEndpoints.create(),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create customer");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: {
      name: string;
      phone: string;
      email?: string;
      birthday?: string;
      address?: string;
      notes?: string;
      isVip?: boolean;
    }
  ): Promise<Customer> => {
    const response = await axiosInstance.put<ApiResponse<Customer>>(
      CustomerEndpoints.update(id),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update customer");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      CustomerEndpoints.delete(id)
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete customer");
    }
  },
};
