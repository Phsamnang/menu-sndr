import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") || undefined;
    const tableId = searchParams.get("tableId") || undefined;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (tableId) where.tableId = tableId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse(
      {
        items: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      "Orders fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return errorResponse("FETCH_ORDERS_ERROR", "Failed to fetch orders", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, customerName, items, discountType, discountValue } = body;

    let subtotal = 0;
    const orderItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: {
            prices: {
              include: { tableType: true },
            },
          },
        });

        if (!menuItem) {
          return errorResponse(
            "NOT_FOUND",
            `Menu item with ID ${item.menuItemId} not found`,
            404
          );
        }

        let unitPrice = 0;
        if (tableId) {
          const table = await prisma.table.findUnique({
            where: { id: tableId },
            include: { tableType: true },
          });
          if (table) {
            const price = menuItem.prices.find(
              (p) => p.tableTypeId === table.tableTypeId
            );
            unitPrice = price?.amount || 0;
          }
        } else {
          unitPrice = menuItem.prices[0]?.amount || 0;
        }

        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });
      }
    }

    let discountAmount = 0;
    if (discountType && discountValue) {
      if (discountType === "percentage") {
        discountAmount = (subtotal * discountValue) / 100;
      } else if (discountType === "amount") {
        discountAmount = discountValue;
      }
    }

    const total = subtotal - discountAmount;

    // Generate order number in format: ddmmyyyy0000
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const datePrefix = `${day}${month}${year}`;

    // Find the last order number for today
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: datePrefix,
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
    });

    let counter = 1;
    if (lastOrder) {
      // Extract the counter from the last order number
      const lastCounter = parseInt(lastOrder.orderNumber.slice(-4), 10);
      if (!isNaN(lastCounter)) {
        counter = lastCounter + 1;
      }
    }

    // Format counter as 4-digit number
    const counterStr = String(counter).padStart(4, "0");
    const orderNumber = `${datePrefix}${counterStr}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableId: tableId || null,
        customerName: customerName || null,
        status: "new",
        discountType: discountType || null,
        discountValue: discountValue || 0,
        subtotal,
        discountAmount,
        total,
        items: {
          create: orderItems,
        },
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

    if (tableId) {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: "occupied" },
      });
    }

    return successResponse(order, "Order created successfully", 201);
  } catch (error: any) {
    console.error("Error creating order:", error);
    return errorResponse("CREATE_ORDER_ERROR", "Failed to create order", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}
