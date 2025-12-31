import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxId: string | null;
  category: string | null;
  paymentTerms: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierData {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  category?: string;
  paymentTerms?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateSupplierData {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  category?: string;
  paymentTerms?: string;
  notes?: string;
  isActive?: boolean;
}

export const supplierService = {
  getAll: async (params?: {
    isActive?: boolean;
    category?: string;
  }): Promise<Supplier[]> => {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined) {
      searchParams.append("isActive", String(params.isActive));
    }
    if (params?.category) {
      searchParams.append("category", params.category);
    }

    const url = `/api/admin/suppliers${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await axiosInstance.get<ApiResponse<Supplier[]>>(url);
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const response = await axiosInstance.get<ApiResponse<Supplier>>(
      `/api/admin/suppliers/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch supplier");
    }
    return result.data;
  },

  create: async (data: CreateSupplierData): Promise<Supplier> => {
    const response = await axiosInstance.post<ApiResponse<Supplier>>(
      "/api/admin/suppliers",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create supplier");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: UpdateSupplierData
  ): Promise<Supplier> => {
    const response = await axiosInstance.put<ApiResponse<Supplier>>(
      `/api/admin/suppliers/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update supplier");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/suppliers/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete supplier");
    }
  },
};


