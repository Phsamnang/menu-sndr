import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            baseUnit: true,
          },
        },
        baseUnit: true,
      },
    });

    if (!inventory) {
      return errorResponse("NOT_FOUND", "Inventory not found", 404);
    }

    return successResponse(inventory, "Inventory fetched successfully");
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

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      currentStock,
      minStockLevel,
      maxStockLevel,
      averageCost,
      lastStockCheck,
    } = body;

    const updateData: any = {};
    if (currentStock !== undefined) updateData.currentStock = currentStock;
    if (minStockLevel !== undefined) updateData.minStockLevel = minStockLevel;
    if (maxStockLevel !== undefined) updateData.maxStockLevel = maxStockLevel;
    if (averageCost !== undefined) updateData.averageCost = averageCost;
    if (lastStockCheck !== undefined)
      updateData.lastStockCheck = new Date(lastStockCheck);
    else if (currentStock !== undefined) updateData.lastStockCheck = new Date();

    const inventory = await prisma.inventory.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          include: {
            baseUnit: true,
          },
        },
        baseUnit: true,
      },
    });

    return successResponse(inventory, "Inventory updated successfully");
  } catch (error: any) {
    console.error("Error updating inventory:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Inventory not found", 404);
    }
    return errorResponse(
      "UPDATE_INVENTORY_ERROR",
      "Failed to update inventory",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.inventory.delete({
      where: { id },
    });

    return successResponse(null, "Inventory deleted successfully");
  } catch (error: any) {
    console.error("Error deleting inventory:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Inventory not found", 404);
    }
    return errorResponse(
      "DELETE_INVENTORY_ERROR",
      "Failed to delete inventory",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => getHandler(req, context), ["admin"])(request);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => putHandler(req, context), ["admin"])(request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => deleteHandler(req, context), ["admin"])(request);
}
