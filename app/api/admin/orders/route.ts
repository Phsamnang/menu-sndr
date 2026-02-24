import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") || undefined;
    const tableId = searchParams.get("tableId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (tableId) where.tableId = tableId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const {
      tableId,
      customerId,
      customerName,
      orderType,
      items,
      discountType,
      discountValue,
      taxRate,
      serviceCharge,
      notes,
      specialNotes,
    } = body;

    let subtotal = 0;
    const orderItems = [];

    if (items && items.length > 0) {
      const menuItemIds = (items as Array<{ menuItemId: string; quantity: number; specialNotes?: string }>).map((item) => item.menuItemId);
      const menuItems = await prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        include: {
          prices: {
            include: { tableType: true },
          },
        },
      });

      const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

      let table = null;
      if (tableId) {
        table = await prisma.table.findUnique({
          where: { id: tableId },
          include: { tableType: true },
        });
      }

      for (const item of items as Array<{ menuItemId: string; quantity: number; specialNotes?: string }>) {
        const menuItem = menuItemMap.get(item.menuItemId);

        if (!menuItem) {
          return errorResponse(
            "NOT_FOUND",
            `Menu item with ID ${item.menuItemId} not found`,
            404
          );
        }

        let unitPrice = 0;
        if (table) {
          const price = menuItem.prices.find(
            (p) => p.tableTypeId === table.tableTypeId
          );
          unitPrice = price?.amount || 0;
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
          specialNotes: item.specialNotes || specialNotes || null,
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

    const taxAmount = taxRate ? (subtotal * taxRate) / 100 : 0;
    const total = subtotal - discountAmount + taxAmount + (serviceCharge || 0);
    const grandTotal = total;

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
        customerId: customerId || null,
        customerName: customerName || null,
        orderType: orderType || "dine_in",
        status: "new",
        discountType: discountType || null,
        discountValue: discountValue || 0,
        subtotal,
        discountAmount,
        taxRate: taxRate || 0,
        taxAmount,
        serviceCharge: serviceCharge || 0,
        total,
        grandTotal,
        paymentStatus: "unpaid",
        notes: notes || null,
        createdBy: request.user?.userId || null,
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            fromStatus: "new",
            toStatus: "new",
            changedBy: request.user?.userId || null,
          },
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

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
