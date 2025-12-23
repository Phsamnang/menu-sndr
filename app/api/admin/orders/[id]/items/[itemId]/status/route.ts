import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function putHandler(
  request: AuthenticatedRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; itemId: string }>;
  }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse(
        "VALIDATION_ERROR",
        "status is required",
        400,
        [{ field: "status", message: "Status is required" }]
      );
    }

    const validStatuses = ["pending", "preparing", "ready", "served", "cancelled"];
    if (!validStatuses.includes(status)) {
      return errorResponse(
        "VALIDATION_ERROR",
        `Status must be one of: ${validStatuses.join(", ")}`,
        400,
        [{ field: "status", message: "Invalid status" }]
      );
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      return errorResponse("NOT_FOUND", "Order item not found", 404);
    }

    if (orderItem.orderId !== id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Order item does not belong to this order",
        400
      );
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status },
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
      },
    });

    return successResponse(updatedItem, "Order item status updated successfully");
  } catch (error: any) {
    console.error("Error updating order item status:", error);
    return errorResponse(
      "UPDATE_ITEM_STATUS_ERROR",
      "Failed to update order item status",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ id: string; itemId: string }>;
  }
) {
  return withAuth((req) => putHandler(req, context), ["admin", "chef", "order"])(request);
}

