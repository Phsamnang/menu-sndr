import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function handler(request: AuthenticatedRequest) {
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
        const cookItems = order.items.filter((item: any) => {
          const menuItem = item.menuItem as any;
          const itemStatus = item.status as string;
          return (
            menuItem.isCook === true &&
            (itemStatus === "pending" || itemStatus === "preparing") &&
            (status ? itemStatus === status : true)
          );
        });
        return {
          ...order,
          items: cookItems,
        };
      })
      .filter((order) => order.items.length > 0);

    return successResponse(
      { items: filteredOrders },
      "Cook orders fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching cook orders:", error);
    return errorResponse(
      "FETCH_COOK_ORDERS_ERROR",
      "Failed to fetch cook orders",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(handler, ["admin", "chef"]);
