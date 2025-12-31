import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { UnitConversionService } from "@/services/unit-conversion.service";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const productId = searchParams.get("productId");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            include: {
              baseUnit: true,
            },
          },
          unit: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return successResponse(
      {
        items: movements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      "Stock movements fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching stock movements:", error);
    return errorResponse(
      "FETCH_STOCK_MOVEMENTS_ERROR",
      "Failed to fetch stock movements",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      type,
      quantity,
      unitId,
      unitCost,
      reason,
      reference,
      notes,
    } = body;

    if (!productId || !type || !quantity || !unitId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Product, type, quantity, and unit are required",
        400,
        [
          ...(!productId
            ? [{ field: "productId", message: "Product is required" }]
            : []),
          ...(!type ? [{ field: "type", message: "Type is required" }] : []),
          ...(!quantity
            ? [{ field: "quantity", message: "Quantity is required" }]
            : []),
          ...(!unitId
            ? [{ field: "unitId", message: "Unit is required" }]
            : []),
        ]
      );
    }

    if (quantity <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Quantity must be greater than 0",
        400,
        [{ field: "quantity", message: "Quantity must be positive" }]
      );
    }

    const validTypes = ["IN", "OUT", "ADJUSTMENT", "WASTE", "RETURN"];
    if (!validTypes.includes(type)) {
      return errorResponse(
        "VALIDATION_ERROR",
        `Type must be one of: ${validTypes.join(", ")}`,
        400,
        [{ field: "type", message: "Invalid movement type" }]
      );
    }

    const movement = await prisma.$transaction(async (tx) => {
      const conversionService = new UnitConversionService(tx);
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { baseUnit: true },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (!product.baseUnitId) {
        throw new Error("Product has no base unit configured");
      }

      const movementUnit = await tx.unit.findUnique({
        where: { id: unitId },
      });

      if (!movementUnit) {
        throw new Error("Movement unit not found");
      }

      let inventory = await tx.inventory.findUnique({
        where: { productId },
        include: {
          baseUnit: true,
        },
      });

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            productId,
            currentStock: 0,
            minStockLevel: 0,
            baseUnitId: product.baseUnitId,
            averageCost: 0,
          },
          include: {
            baseUnit: true,
          },
        });
      }

      const quantityInBase = await conversionService.convertToBaseUnit(
        productId,
        quantity,
        unitId
      );

      if (quantityInBase <= 0) {
        throw new Error("Converted quantity must be greater than 0");
      }

      let unitCostInBase = unitCost || null;
      if (unitCost && unitCost > 0 && unitId !== product.baseUnitId) {
        const conversionRate = await conversionService.convert(
          1,
          unitId,
          product.baseUnitId
        );
        unitCostInBase = unitCost / conversionRate;
      }

      const totalCost = unitCost ? unitCost * quantity : null;

      if (type === "OUT" || type === "WASTE") {
        if (inventory.currentStock < quantityInBase) {
          throw new Error(
            `Insufficient stock. Available: ${inventory.currentStock} ${inventory.baseUnit.displayName}, Requested: ${quantityInBase} ${inventory.baseUnit.displayName}`
          );
        }
      }

      let newStock = inventory.currentStock;
      let newAverageCost = inventory.averageCost;

      if (type === "IN" || type === "RETURN") {
        newStock = inventory.currentStock + quantityInBase;
        if (unitCostInBase && unitCostInBase > 0) {
          const totalValue = inventory.currentStock * inventory.averageCost;
          const newValue = quantityInBase * unitCostInBase;
          newAverageCost =
            newStock > 0 ? (totalValue + newValue) / newStock : unitCostInBase;
        }
      } else if (type === "OUT" || type === "WASTE") {
        newStock = inventory.currentStock - quantityInBase;
        if (newStock < 0) {
          throw new Error("Cannot have negative stock");
        }
      } else if (type === "ADJUSTMENT") {
        newStock = quantityInBase;
      }

      const stockMovement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          unitId,
          quantityInBase,
          unitCost: unitCost || null,
          totalCost,
          reason: reason || null,
          reference: reference || null,
          notes: notes || null,
          performedBy: request.user?.userId || null,
        },
      });

      const updateData: any = {
        currentStock: newStock,
        averageCost: newAverageCost,
        lastStockCheck: new Date(),
      };

      if (type === "IN") {
        updateData.lastRestocked = new Date();
      }

      await tx.inventory.update({
        where: { productId },
        data: updateData,
      });

      return stockMovement;
    });

    const movementWithRelations = await prisma.stockMovement.findUnique({
      where: { id: movement.id },
      include: {
        product: {
          include: {
            baseUnit: true,
          },
        },
        unit: true,
      },
    });

    return successResponse(
      movementWithRelations,
      "Stock movement created successfully",
      201
    );
  } catch (error: any) {
    console.error("Error creating stock movement:", error);

    if (
      error?.message?.includes("conversion") ||
      error?.message?.includes("Insufficient stock") ||
      error?.message?.includes("negative stock")
    ) {
      return errorResponse("UNIT_CONVERSION_ERROR", error.message, 400, [
        { field: "quantity", message: error.message },
      ]);
    }

    return errorResponse(
      "CREATE_STOCK_MOVEMENT_ERROR",
      "Failed to create stock movement",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);
