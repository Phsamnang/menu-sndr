import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: {
      id: string;
      name: string;
      displayName: string;
    };
  };
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      "/api/auth/login",
      { username, password },
      { requireAuth: false } as any
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Invalid username or password");
    }

    return result.data;
  },
};
