import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface AuditLog {
  id: string;
  userId: string | null;
  user: {
    id: string;
    username: string;
    fullName: string | null;
  } | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  items: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditLogService = {
  getAll: async (filters?: AuditLogFilters): Promise<AuditLogResponse> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.entity) params.append("entity", filters.entity);
    if (filters?.entityId) params.append("entityId", filters.entityId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await axiosInstance.get<ApiResponse<AuditLogResponse>>(
      `/api/admin/audit-logs${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return {
        items: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        },
      };
    }
    return result.data;
  },
};

