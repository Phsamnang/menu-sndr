import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export class UnitConversionService {
  private client: typeof prisma | PrismaTransaction;

  constructor(client?: PrismaTransaction) {
    this.client = client || prisma;
  }

  async convert(
    quantity: number,
    fromUnitId: string,
    toUnitId: string
  ): Promise<number> {
    if (fromUnitId === toUnitId) {
      return quantity;
    }

    const directConversion = await this.client.unitConversion.findUnique({
      where: {
        fromUnitId_toUnitId: {
          fromUnitId,
          toUnitId,
        },
      },
    });

    if (directConversion) {
      return quantity * directConversion.conversionRate;
    }

    const reverseConversion = await this.client.unitConversion.findUnique({
      where: {
        fromUnitId_toUnitId: {
          fromUnitId: toUnitId,
          toUnitId: fromUnitId,
        },
      },
    });

    if (reverseConversion) {
      return quantity / reverseConversion.conversionRate;
    }

    throw new Error(
      `No conversion rate found between units ${fromUnitId} and ${toUnitId}`
    );
  }

  async convertToBaseUnit(
    productId: string,
    quantity: number,
    fromUnitId: string
  ): Promise<number> {
    const product = await this.client.product.findUnique({
      where: { id: productId },
      include: { baseUnit: true },
    });

    if (!product || !product.baseUnitId) {
      throw new Error(`Product ${productId} not found or has no base unit`);
    }

    return this.convert(quantity, fromUnitId, product.baseUnitId);
  }

  async getProductUnits(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { baseUnit: true },
    });

    if (!product || !product.baseUnitId) {
      throw new Error(`Product ${productId} not found or has no base unit`);
    }

    const baseUnit = product.baseUnit!;
    const units = [baseUnit];

    const conversions = await prisma.unitConversion.findMany({
      where: {
        OR: [
          { fromUnitId: baseUnit.id },
          { toUnitId: baseUnit.id },
        ],
      },
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });

    for (const conv of conversions) {
      const otherUnit = conv.fromUnitId === baseUnit.id ? conv.toUnit : conv.fromUnit;
      if (!units.find((u) => u.id === otherUnit.id)) {
        units.push(otherUnit);
      }
    }

    return units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      displayName: unit.displayName,
      symbol: unit.symbol,
      isBase: unit.id === baseUnit.id,
    }));
  }
}

export interface UnitConversion {
  id: string;
  fromUnitId: string;
  fromUnit: {
    id: string;
    name: string;
    displayName: string;
    symbol: string | null;
  };
  toUnitId: string;
  toUnit: {
    id: string;
    name: string;
    displayName: string;
    symbol: string | null;
  };
  conversionRate: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitConversionData {
  fromUnitId: string;
  toUnitId: string;
  conversionRate: number;
  description?: string;
}

export interface UpdateUnitConversionData {
  conversionRate?: number;
  description?: string;
}

export const unitConversionService = {
  getAll: async (filters?: {
    fromUnitId?: string;
    toUnitId?: string;
  }): Promise<UnitConversion[]> => {
    const params = new URLSearchParams();
    if (filters?.fromUnitId) params.append("fromUnitId", filters.fromUnitId);
    if (filters?.toUnitId) params.append("toUnitId", filters.toUnitId);

    const response = await axiosInstance.get<ApiResponse<UnitConversion[]>>(
      `/api/admin/unit-conversions${params.toString() ? `?${params.toString()}` : ""}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      return [];
    }
    return result.data;
  },

  getById: async (id: string): Promise<UnitConversion> => {
    const response = await axiosInstance.get<ApiResponse<UnitConversion>>(
      `/api/admin/unit-conversions/${id}`
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to fetch unit conversion");
    }
    return result.data;
  },

  create: async (
    data: CreateUnitConversionData
  ): Promise<UnitConversion> => {
    const response = await axiosInstance.post<ApiResponse<UnitConversion>>(
      "/api/admin/unit-conversions",
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create unit conversion");
    }
    return result.data;
  },

  update: async (
    id: string,
    data: UpdateUnitConversionData
  ): Promise<UnitConversion> => {
    const response = await axiosInstance.put<ApiResponse<UnitConversion>>(
      `/api/admin/unit-conversions/${id}`,
      data
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update unit conversion");
    }
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/admin/unit-conversions/${id}`
    );
    const result = response.data;
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete unit conversion");
    }
  },
};
