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

    if (fromUnitId === product.baseUnitId) {
      return quantity;
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

