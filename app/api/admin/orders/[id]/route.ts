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
        customer: true,
        items: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
            kitchenOrder: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
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
    const {
      status,
      customerId,
      orderType,
      discountType,
      discountValue,
      taxRate,
      serviceCharge,
      paymentStatus,
      paymentMethod,
      paidAmount,
      notes,
      cancelReason,
    } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        subtotal: true,
        discountType: true,
        discountValue: true,
        taxRate: true,
        serviceCharge: true,
        status: true,
        tableId: true,
      },
    });

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    let discountAmount = 0;
    const finalDiscountType = discountType !== undefined ? discountType : order.discountType;
    const finalDiscountValue = discountValue !== undefined ? discountValue : order.discountValue;
    const finalTaxRate = taxRate !== undefined ? taxRate : order.taxRate;
    const finalServiceCharge = serviceCharge !== undefined ? serviceCharge : order.serviceCharge;

    if (finalDiscountType && finalDiscountValue !== undefined) {
      if (finalDiscountType === "percentage") {
        discountAmount = (order.subtotal * finalDiscountValue) / 100;
      } else if (finalDiscountType === "amount") {
        discountAmount = finalDiscountValue;
      }
    }

    const taxAmount = (order.subtotal * finalTaxRate) / 100;
    const total = order.subtotal - discountAmount + taxAmount + finalServiceCharge;
    const grandTotal = total;
    const changeAmount = paidAmount ? Math.max(0, paidAmount - grandTotal) : 0;

    const updateData: any = {
      discountType: finalDiscountType,
      discountValue: finalDiscountValue,
      discountAmount,
      taxRate: finalTaxRate,
      taxAmount,
      serviceCharge: finalServiceCharge,
      total,
      grandTotal,
    };

    if (status !== undefined) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedAt = new Date();
        // Automatically set paymentStatus to "paid" when order is completed
        updateData.paymentStatus = "paid";
      } else if (status === "cancelled") {
        updateData.cancelledAt = new Date();
        updateData.cancelReason = cancelReason || null;
      }
    }

    if (customerId !== undefined) updateData.customerId = customerId || null;
    if (orderType !== undefined) updateData.orderType = orderType;
    // Only set paymentStatus if status is not "completed" (already set above)
    if (paymentStatus !== undefined && status !== "completed") {
      updateData.paymentStatus = paymentStatus;
    }
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount;
    if (changeAmount !== undefined) updateData.changeAmount = changeAmount;
    if (notes !== undefined) updateData.notes = notes;

    const [updatedOrder] = await Promise.all([
      prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          table: {
            include: {
              tableType: true,
            },
          },
          customer: true,
          items: {
            include: {
              menuItem: {
                include: {
                  category: true,
                },
              },
            },
          },
          payments: true,
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      }),
      status && status !== order.status
        ? prisma.orderStatusHistory.create({
            data: {
              orderId: id,
              fromStatus: order.status,
              toStatus: status,
              changedBy: request.user?.userId || null,
            },
          })
        : Promise.resolve(null),
      status === "completed" && order.tableId
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
