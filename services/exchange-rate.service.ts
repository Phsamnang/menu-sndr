import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  source: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface CreateExchangeRateData {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate?: string;
  source?: string;
}

export const exchangeRateService = {
  getAll: async (filters?: {
    fromCurrency?: string;
    toCurrency?: string;
    latest?: boolean;
  }): Promise<ExchangeRate[]> => {
    const params = new URLSearchParams();
    if (filters?.fromCurrency)
      params.append("fromCurrency", filters.fromCurrency);
    if (filters?.toCurrency) params.append("toCurrency", filters.toCurrency);
    if (filters?.latest) params.append("latest", "true");

    const response = await axiosInstance.get<ApiResponse<ExchangeRate[]>>(
      `/api/admin/exchange-rates${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  create: async (data: CreateExchangeRateData): Promise<ExchangeRate> => {
    const response = await axiosInstance.post<ApiResponse<ExchangeRate>>(
      "/api/admin/exchange-rates",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create exchange rate");
    }
    return result.data;
  },
};

