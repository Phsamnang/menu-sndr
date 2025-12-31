import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface Notification {
  id: string;
  userId: string | null;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface CreateNotificationData {
  userId?: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  actionUrl?: string;
}

export const notificationService = {
  getAll: async (filters?: {
    userId?: string;
    type?: string;
    isRead?: boolean;
    priority?: string;
  }): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.isRead !== undefined)
      params.append("isRead", filters.isRead.toString());
    if (filters?.priority) params.append("priority", filters.priority);

    const response = await axiosInstance.get<ApiResponse<Notification[]>>(
      `/api/admin/notifications${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await axiosInstance.put<ApiResponse<Notification>>(
      `/api/admin/notifications/${id}`,
      { isRead: true }
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update notification");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/notifications/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete notification");
    }
  },

  create: async (data: CreateNotificationData): Promise<Notification> => {
    const response = await axiosInstance.post<ApiResponse<Notification>>(
      "/api/admin/notifications",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create notification");
    }
    return result.data;
  },
};

