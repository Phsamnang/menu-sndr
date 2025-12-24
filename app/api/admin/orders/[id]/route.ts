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

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, discountType, discountValue } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        subtotal: true,
        discountType: true,
        discountValue: true,
        status: true,
        tableId: true,
      },
    });

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    let discountAmount = 0;
    const finalDiscountType = discountType || order.discountType;
    const finalDiscountValue = discountValue !== undefined ? discountValue : order.discountValue;

    if (finalDiscountType && finalDiscountValue !== undefined) {
      if (finalDiscountType === "percentage") {
        discountAmount = (order.subtotal * finalDiscountValue) / 100;
      } else if (finalDiscountType === "amount") {
        discountAmount = finalDiscountValue;
      }
    }

    const total = order.subtotal - discountAmount;

    const [updatedOrder] = await Promise.all([
      prisma.order.update({
        where: { id },
        data: {
          status: status || order.status,
          discountType: finalDiscountType,
          discountValue: finalDiscountValue,
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
      }),
      status === "done" && order.tableId
        ? prisma.table.update({
            where: { id: order.tableId },
            data: { status: "available" },
          })
        : Promise.resolve(null),
    ]);

    return successResponse(updatedOrder, "Order updated successfully");
  } catch (error: any) {
    console.error("Error updating order:", error);
    return errorResponse("UPDATE_ORDER_ERROR", "Failed to update order", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        tableId: true,
      },
    });

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    await prisma.$transaction([
      prisma.order.delete({
        where: { id },
      }),
      order.tableId
        ? prisma.table.update({
            where: { id: order.tableId },
            data: { status: "available" },
          })
        : Promise.resolve(null),
    ]);

    return successResponse(null, "Order deleted successfully");
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return errorResponse("DELETE_ORDER_ERROR", "Failed to delete order", 500, [
      { message: error?.message || String(error) },
    ]);
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
