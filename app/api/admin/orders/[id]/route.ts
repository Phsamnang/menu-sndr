import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    return successResponse(order, "Order fetched successfully");
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return errorResponse("FETCH_ORDER_ERROR", "Failed to fetch order", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, discountType, discountValue } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    let discountAmount = 0;
    if (discountType && discountValue !== undefined) {
      if (discountType === "percentage") {
        discountAmount = (order.subtotal * discountValue) / 100;
      } else if (discountType === "amount") {
        discountAmount = discountValue;
      }
    }

    const total = order.subtotal - discountAmount;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status || order.status,
        discountType: discountType || order.discountType,
        discountValue:
          discountValue !== undefined ? discountValue : order.discountValue,
        discountAmount,
        total,
      },
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

    if (status === "done" && order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: "available" },
      });
    }

    return successResponse(updatedOrder, "Order updated successfully");
  } catch (error: any) {
    console.error("Error updating order:", error);
    return errorResponse("UPDATE_ORDER_ERROR", "Failed to update order", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    if (order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: "available" },
      });
    }

    await prisma.order.delete({
      where: { id },
    });

    return successResponse(null, "Order deleted successfully");
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return errorResponse("DELETE_ORDER_ERROR", "Failed to delete order", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}
