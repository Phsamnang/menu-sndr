import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: {
          include: {
            tableType: true,
          },
        },
        items: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    // Only allow access to orders with status "new" or "on_process"
    if (order.status !== "new" && order.status !== "on_process") {
      return errorResponse(
        "FORBIDDEN",
        "Order is not available for customer access",
        403
      );
    }

    return successResponse(order, "Order fetched successfully");
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return errorResponse("FETCH_ORDER_ERROR", "Failed to fetch order", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}
