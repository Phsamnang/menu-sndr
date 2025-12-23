import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const where: any = {
      status: {
        in: ["new", "on_process"],
      },
    };

    const allOrders = await prisma.order.findMany({
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
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const filteredOrders = allOrders
      .map((order) => {
        const deliveryItems = order.items.filter((item: any) => {
          const menuItem = item.menuItem as any;
          const itemStatus = item.status as string;

          if (menuItem.isCook === true) {
            return (
              itemStatus === "ready" && (status ? itemStatus === status : true)
            );
          } else {
            return (
              itemStatus !== "served" &&
              itemStatus !== "cancelled" &&
              (status ? itemStatus === status : true)
            );
          }
        });
        return {
          ...order,
          items: deliveryItems,
        };
      })
      .filter((order) => order.items.length > 0);

    return successResponse(
      { items: filteredOrders },
      "Delivery items fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching delivery items:", error);
    return errorResponse(
      "FETCH_DELIVERY_ITEMS_ERROR",
      "Failed to fetch delivery items",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}
