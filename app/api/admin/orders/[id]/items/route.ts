import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function POST(
  request: NextRequest,
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
        [{ field: "menuItemId", message: "Price not available for this table type" }]
      );
    }

    const existingItem = await prisma.orderItem.findFirst({
      where: {
        orderId: id,
        menuItemId: menuItemId,
      },
    });

    let orderItem;
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

    await updateOrderTotals(id);

    const updatedOrder = await prisma.order.findUnique({
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
    });

    return successResponse(updatedOrder, "Item added to order successfully");
  } catch (error: any) {
    console.error("Error adding item to order:", error);
    return errorResponse(
      "ADD_ITEM_ERROR",
      "Failed to add item to order",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function PUT(
  request: NextRequest,
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
      });

      if (!orderItem) {
        return errorResponse("NOT_FOUND", "Order item not found", 404);
      }

      await prisma.orderItem.update({
        where: { id: itemId },
        data: {
          quantity: quantity,
          totalPrice: quantity * orderItem.unitPrice,
        },
      });
    }

    await updateOrderTotals(id);

    const updatedOrder = await prisma.order.findUnique({
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
    });

    return successResponse(updatedOrder, "Order item updated successfully");
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "itemId is required",
        400,
        [{ field: "itemId", message: "Item ID is required" }]
      );
    }

    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    await updateOrderTotals(id);

    const updatedOrder = await prisma.order.findUnique({
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
    });

    return successResponse(updatedOrder, "Order item deleted successfully");
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
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return;

  const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);

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

