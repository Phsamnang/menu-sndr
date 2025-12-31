import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

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
              unit: true,
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
          ...(!productId ? [{ field: "productId", message: "Product is required" }] : []),
          ...(!type ? [{ field: "type", message: "Type is required" }] : []),
          ...(!quantity ? [{ field: "quantity", message: "Quantity is required" }] : []),
          ...(!unitId ? [{ field: "unitId", message: "Unit is required" }] : []),
        ]
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

    const totalCost = unitCost ? unitCost * quantity : null;

    const movement = await prisma.$transaction(async (tx) => {
      const stockMovement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          unitId,
          unitCost: unitCost || null,
          totalCost,
          reason: reason || null,
          reference: reference || null,
          notes: notes || null,
          performedBy: request.user?.userId || null,
        },
      });

      let inventory = await tx.inventory.findUnique({
        where: { productId },
      });

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            productId,
            currentStock: 0,
            minStockLevel: 0,
            unitId,
            averageCost: unitCost || 0,
          },
        });
      }

      let newStock = inventory.currentStock;
      let newAverageCost = inventory.averageCost;

      if (type === "IN" || type === "RETURN") {
        newStock = inventory.currentStock + quantity;
        if (unitCost && unitCost > 0) {
          const totalValue = inventory.currentStock * inventory.averageCost;
          const newValue = quantity * unitCost;
          newAverageCost = (totalValue + newValue) / newStock;
        }
      } else if (type === "OUT" || type === "WASTE") {
        newStock = Math.max(0, inventory.currentStock - quantity);
      } else if (type === "ADJUSTMENT") {
        newStock = quantity;
      }

      const updateData: any = {
        currentStock: newStock,
        averageCost: newAverageCost,
      };

      if (type === "IN") {
        updateData.lastRestocked = new Date();
      }
      updateData.lastStockCheck = new Date();

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
            unit: true,
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

