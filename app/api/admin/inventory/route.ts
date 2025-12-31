import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock") === "true";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    let inventoryWhere = where;
    if (lowStock) {
      const allInventories = await prisma.inventory.findMany({
        select: { id: true, currentStock: true, minStockLevel: true },
      });
      const lowStockIds = allInventories
        .filter((inv) => inv.currentStock <= inv.minStockLevel)
        .map((inv) => inv.id);
      if (lowStockIds.length > 0) {
        inventoryWhere = { ...where, id: { in: lowStockIds } };
      } else {
        inventoryWhere = { ...where, id: { in: [] } };
      }
    }

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where: inventoryWhere,
        include: {
          product: {
            include: {
              baseUnit: true,
            },
          },
          baseUnit: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.inventory.count({ where: inventoryWhere }),
    ]);

    return successResponse(
      {
        items: inventories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      "Inventory fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching inventory:", error);
    return errorResponse(
      "FETCH_INVENTORY_ERROR",
      "Failed to fetch inventory",
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
      currentStock,
      minStockLevel,
      maxStockLevel,
      averageCost,
    } = body;

    if (!productId) {
      return errorResponse("VALIDATION_ERROR", "Product is required", 400, [
        { field: "productId", message: "Product is required" },
      ]);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { baseUnit: true },
    });

    if (!product) {
      return errorResponse("NOT_FOUND", "Product not found", 404, [
        { field: "productId", message: "Product does not exist" },
      ]);
    }

    if (!product.baseUnitId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Product must have a base unit configured",
        400,
        [{ field: "productId", message: "Product has no base unit" }]
      );
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (existingInventory) {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Inventory already exists for this product",
        409,
        [{ field: "productId", message: "Product already has inventory" }]
      );
    }

    const inventory = await prisma.inventory.create({
      data: {
        productId,
        currentStock: currentStock || 0,
        minStockLevel: minStockLevel || 0,
        maxStockLevel: maxStockLevel || null,
        baseUnitId: product.baseUnitId,
        averageCost: averageCost || 0,
      },
      include: {
        product: {
          include: {
            baseUnit: true,
          },
        },
        baseUnit: true,
      },
    });

    return successResponse(inventory, "Inventory created successfully", 201);
  } catch (error: any) {
    console.error("Error creating inventory:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Inventory already exists for this product",
        409,
        [{ field: "productId", message: "Product already has inventory" }]
      );
    }
    return errorResponse(
      "CREATE_INVENTORY_ERROR",
      "Failed to create inventory",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);
