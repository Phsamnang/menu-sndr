import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference: string | null;
  cardLast4: string | null;
  notes: string | null;
  processedBy: string | null;
  createdAt: string;
  refundedAt: string | null;
}

export interface CreatePaymentData {
  amount: number;
  currency?: string;
  method: string;
  reference?: string;
  notes?: string;
}

export const paymentService = {
  getByOrderId: async (
    orderId: string
  ): Promise<{ items: Payment[]; total: number }> => {
    const response = await axiosInstance.get<
      ApiResponse<{ items: Payment[]; total: number }>
    >(`/api/admin/orders/${orderId}/payments`);
    const result = response.data;
    if (!result.success || !result.data) {
      return { items: [], total: 0 };
    }
    return result.data;
  },

  create: async (
    orderId: string,
    data: CreatePaymentData
  ): Promise<Payment> => {
    const response = await axiosInstance.post<ApiResponse<Payment>>(
      `/api/admin/orders/${orderId}/payments`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create payment");
    }
    return result.data;
  },

  refund: async (
    orderId: string,
    paymentId: string,
    reason?: string
  ): Promise<Payment> => {
    const response = await axiosInstance.post<ApiResponse<Payment>>(
      `/api/admin/orders/${orderId}/payments/${paymentId}/refund`,
      { reason }
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to refund payment");
    }
    return result.data;
  },
};
