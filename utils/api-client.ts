import axiosInstance from "./axios-client";
import { AxiosRequestConfig } from "axios";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
  message?: string;
  timestamp?: string;
}

export async function apiClient<T = any>(
  url: string,
  config?: AxiosRequestConfig & { requireAuth?: boolean }
): Promise<ApiResponse<T>> {
  try {
    const { requireAuth = true, ...axiosConfig } = config || {};

    const response = await axiosInstance.request<ApiResponse<T>>({
      url,
      ...axiosConfig,
      requireAuth,
    } as any);

    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }

    return {
      success: false,
      error: {
        code: "REQUEST_ERROR",
        message: error.message || "An error occurred",
      },
    };
  }
}

export async function apiClientJson<T = any>(
  url: string,
  config?: AxiosRequestConfig & { requireAuth?: boolean }
): Promise<ApiResponse<T>> {
  return apiClient<T>(url, config);
}
