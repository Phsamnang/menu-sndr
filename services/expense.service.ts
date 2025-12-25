import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface ExpenseItem {
  id: string;
  expenseId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitId: string | null;
  unit: {
    id: string;
    name: string;
    displayName: string;
    symbol: string | null;
  } | null;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    unit: {
      id: string;
      name: string;
      displayName: string;
    } | null;
    category: string | null;
  } | null;
}

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string;
  date: string;
  receiptNumber: string | null;
  vendor: string | null;
  paymentMethod: string | null;
  receiptImage: string | null;
  notes: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items?: ExpenseItem[];
}

export interface ExpenseFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export interface CreateExpenseItemData {
  productId?: string;
  productName: string;
  quantity: number;
  unitId?: string;
  unitPrice: number;
  currency?: string;
  paymentStatus?: string;
  notes?: string;
}

export interface CreateExpenseData {
  title: string;
  description?: string;
  category: string;
  date?: string;
  receiptNumber?: string;
  vendor?: string;
  paymentMethod?: string;
  receiptImage?: string;
  notes?: string;
  currency?: string;
  items?: CreateExpenseItemData[];
}

export interface UpdateExpenseData {
  title?: string;
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
  receiptNumber?: string;
  vendor?: string;
  paymentMethod?: string;
  receiptImage?: string;
  notes?: string;
}

export const expenseService = {
  getAll: async (
    filters?: ExpenseFilters
  ): Promise<{ items: Expense[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const url = params.toString()
      ? `/api/admin/expenses?${params.toString()}`
      : "/api/admin/expenses";

    const response = await axiosInstance.get<
      ApiResponse<{ items: Expense[]; total: number }>
    >(url);
    const result = response.data;
    if (!result.success || !result.data) {
      return { items: [], total: 0 };
    }
    return result.data;
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await axiosInstance.get<ApiResponse<Expense>>(
      `/api/admin/expenses/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch expense");
    }
    return result.data;
  },

  create: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await axiosInstance.post<ApiResponse<Expense>>(
      "/api/admin/expenses",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create expense");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: UpdateExpenseData
  ): Promise<Expense> => {
    const response = await axiosInstance.put<ApiResponse<Expense>>(
      `/api/admin/expenses/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update expense");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/expenses/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete expense");
    }
  },
};

