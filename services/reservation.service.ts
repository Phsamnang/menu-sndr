import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Reservation {
  id: string;
  tableId: string;
  table?: {
    id: string;
    number: string;
    name?: string;
    tableType?: {
      id: string;
      name: string;
      displayName: string;
    };
  };
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  customerName: string;
  customerPhone: string;
  guestCount: number;
  reservedDate: string;
  reservedTime: string;
  duration: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationFilters {
  page?: number;
  limit?: number;
  status?: string;
  date?: string;
}

const ReservationEndpoints = {
  BASE: "/api/admin/reservations",
  getAll: () => ReservationEndpoints.BASE,
  getById: (id: string) => `${ReservationEndpoints.BASE}/${id}`,
  create: () => ReservationEndpoints.BASE,
  update: (id: string) => `${ReservationEndpoints.BASE}/${id}`,
  delete: (id: string) => `${ReservationEndpoints.BASE}/${id}`,
};

export const reservationService = {
  getAll: async (
    filters?: ReservationFilters
  ): Promise<{
    items: Reservation[];
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
    if (filters?.status) params.append("status", filters.status);
    if (filters?.date) params.append("date", filters.date);

    const url = params.toString()
      ? `${ReservationEndpoints.getAll()}?${params.toString()}`
      : ReservationEndpoints.getAll();

    const response = await axiosInstance.get<
      ApiResponse<{
        items: Reservation[];
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

  getById: async (id: string): Promise<Reservation> => {
    const response = await axiosInstance.get<ApiResponse<Reservation>>(
      ReservationEndpoints.getById(id)
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch reservation");
    }
    return result.data;
  },

  create: async (data: {
    tableId: string;
    customerId?: string;
    customerName: string;
    customerPhone: string;
    guestCount: number;
    reservedDate: string;
    reservedTime: string;
    duration?: number;
    notes?: string;
  }): Promise<Reservation> => {
    const response = await axiosInstance.post<ApiResponse<Reservation>>(
      ReservationEndpoints.create(),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create reservation");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: {
      status?: string;
      tableId?: string;
      guestCount?: number;
      reservedDate?: string;
      reservedTime?: string;
      duration?: number;
      notes?: string;
    }
  ): Promise<Reservation> => {
    const response = await axiosInstance.put<ApiResponse<Reservation>>(
      ReservationEndpoints.update(id),
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update reservation");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      ReservationEndpoints.delete(id)
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete reservation");
    }
  },
};
