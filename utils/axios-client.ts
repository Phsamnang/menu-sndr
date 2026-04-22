import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getTokenSync, removeToken } from "./token";

const axiosInstance: AxiosInstance = axios.create({
  baseURL:
    typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requireAuth = (config as any).requireAuth !== false;

    if (requireAuth) {
      const token = getTokenSync();
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } else {
      if (config.headers && config.headers["Authorization"]) {
        delete config.headers["Authorization"];
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const isLoginEndpoint = error.config?.url?.includes("/api/auth/login");

    if (error.response?.status === 401 && !isLoginEndpoint) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Surface the server's error message instead of Axios's generic one
    const serverMessage = (error.response?.data as any)?.error?.message;
    if (serverMessage) {
      return Promise.reject(new Error(serverMessage));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
