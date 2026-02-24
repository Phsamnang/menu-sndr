import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

async function updateOrderTotals(orderId: string) {
  const result = await prisma.orderItem.aggregate({
    where: { orderId },
    _sum: { totalPrice: true },
  });

  const subtotal = result._sum.totalPrice || 0;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      discountType: true,
      discountValue: true,
    },
  });

  if (!order) return;

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
  try {
    const { id } = await context.params;
    
    // Check if request has body
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Content-Type must be application/json",
        400
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid JSON in request body",
        400,
        [{ message: "Request body must be valid JSON" }]
      );
    }

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

    // Check if order exists and is accessible
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: {
          include: { tableType: true },
        },
      },
    });

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    // Only allow adding items to orders with status "new" or "on_process"
    if (order.status !== "new" && order.status !== "on_process") {
      return errorResponse(
        "FORBIDDEN",
        "Cannot add items to this order",
        403
      );
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        prices: {
          include: { tableType: true },
        },
      },
    });

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

    let orderItem;

    if (order.status === "new") {
      orderItem = await prisma.orderItem.create({
        data: {
          orderId: id,
          menuItemId: menuItemId,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: quantity * unitPrice,
        },
      });
    } else {
      const existingItem = await prisma.orderItem.findFirst({
        where: {
          orderId: id,
          menuItemId: menuItemId,
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        orderItem = await prisma.orderItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            totalPrice: newQuantity * unitPrice,
          },
        });
      } else {
        orderItem = await prisma.orderItem.create({
          data: {
            orderId: id,
            menuItemId: menuItemId,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: quantity * unitPrice,
          },
        });
      }
    }

    const [updatedOrder] = await Promise.all([
      prisma.order.findUnique({
        where: { id },
        include: {
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
      updateOrderTotals(id),
    ]);

    return successResponse(updatedOrder, "Item added to order successfully");
  } catch (error: any) {
    console.error("Error adding item to order:", error);
    return errorResponse("ADD_ITEM_ERROR", "Failed to add item to order", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}
