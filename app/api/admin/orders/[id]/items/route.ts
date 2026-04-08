import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function postHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { menuItemId, quantity } = body;

    if (!menuItemId || !quantity || quantity < 1) {
      return errorResponse(
        "VALIDATION_ERROR",
        "menuItemId and quantity are required",
        400,
        [
          ...(!menuItemId
            ? [{ field: "menuItemId", message: "Menu item ID is required" }]
            : []),
          ...(!quantity || quantity < 1
            ? [{ field: "quantity", message: "Quantity must be at least 1" }]
            : []),
        ]
      );
    }

    // Only select the fields we need — not full includes
    const [order, menuItem] = await Promise.all([
      prisma.order.findUnique({
        where: { id },
        select: {
          status: true,
          tableId: true,
          table: {
            select: { tableTypeId: true },
          },
        },
      }),
      prisma.menuItem.findUnique({
        where: { id: menuItemId },
        select: {
          prices: {
            select: { tableTypeId: true, amount: true },
          },
        },
      }),
    ]);

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    if (!menuItem) {
      return errorResponse("NOT_FOUND", "Menu item not found", 404);
    }

    let unitPrice = 0;
    if (order.tableId && order.table) {
      const price = menuItem.prices.find(
        (p) => p.tableTypeId === order.table!.tableTypeId
      );
      unitPrice = price?.amount || 0;
    } else {
      unitPrice = menuItem.prices[0]?.amount || 0;
    }

    if (unitPrice === 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "No price found for this menu item",
        400,
        [
          {
            field: "menuItemId",
            message: "Price not available for this table type",
          },
        ]
      );
    }

    if (order.status === "new") {
      await prisma.orderItem.create({
        data: {
          orderId: id,
          menuItemId,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        },
      });
    } else {
      const existingItem = await prisma.orderItem.findFirst({
        where: { orderId: id, menuItemId },
        select: { id: true, quantity: true },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        await prisma.orderItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            totalPrice: newQuantity * unitPrice,
          },
        });
      } else {
        await prisma.orderItem.create({
          data: {
            orderId: id,
            menuItemId,
            quantity,
            unitPrice,
            totalPrice: quantity * unitPrice,
          },
        });
      }
    }

    await updateOrderTotals(id);

    return successResponse({ orderId: id }, "Item added to order successfully");
  } catch (error: any) {
    console.error("Error adding item to order:", error);
    return errorResponse("ADD_ITEM_ERROR", "Failed to add item to order", 500, [
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
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined || quantity < 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "itemId and quantity are required",
        400
      );
    }

    if (quantity === 0) {
      await prisma.orderItem.delete({
        where: { id: itemId },
      });
    } else {
      const orderItem = await prisma.orderItem.findUnique({
        where: { id: itemId },
        select: { unitPrice: true },
      });

      if (!orderItem) {
        return errorResponse("NOT_FOUND", "Order item not found", 404);
      }

      await prisma.orderItem.update({
        where: { id: itemId },
        data: {
          quantity,
          totalPrice: quantity * orderItem.unitPrice,
        },
      });
    }

    await updateOrderTotals(id);

    return successResponse({ orderId: id }, "Order item updated successfully");
  } catch (error: any) {
    console.error("Error updating order item:", error);
    return errorResponse(
      "UPDATE_ITEM_ERROR",
      "Failed to update order item",
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
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return errorResponse("VALIDATION_ERROR", "itemId is required", 400, [
        { field: "itemId", message: "Item ID is required" },
      ]);
    }

    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    await updateOrderTotals(id);

    return successResponse({ orderId: id }, "Order item deleted successfully");
  } catch (error: any) {
    console.error("Error deleting order item:", error);
    return errorResponse(
      "DELETE_ITEM_ERROR",
      "Failed to delete order item",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function updateOrderTotals(orderId: string) {
  // Run aggregate + order fetch in parallel instead of sequentially
  const [result, order] = await Promise.all([
    prisma.orderItem.aggregate({
      where: { orderId },
      _sum: { totalPrice: true },
    }),
    prisma.order.findUnique({
      where: { id: orderId },
      select: {
        discountType: true,
        discountValue: true,
      },
    }),
  ]);

  if (!order) return;

  const subtotal = result._sum.totalPrice || 0;

  let discountAmount = 0;
  if (order.discountType && order.discountValue) {
    if (order.discountType === "percentage") {
      discountAmount = (subtotal * order.discountValue) / 100;
    } else if (order.discountType === "amount") {
      discountAmount = order.discountValue;
    }
  }

  const total = subtotal - discountAmount;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      subtotal,
      discountAmount,
      total,
    },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => postHandler(req, context), ["admin"])(request);
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
