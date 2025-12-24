import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const itemStatusFilter = status
      ? [status]
      : ["pending", "preparing", "ready"];

    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["new", "on_process"],
        },
        items: {
          some: {
            OR: [
              {
                menuItem: {
                  isCook: true,
                },
                status: "ready",
              },
              {
                menuItem: {
                  isCook: false,
                },
                status: {
                  in: ["pending", "preparing", "ready"],
                },
              },
            ],
            status: status
              ? status
              : {
                  notIn: ["served", "cancelled"],
                },
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
          where: {
            OR: [
              {
                menuItem: {
                  isCook: true,
                },
                status: "ready",
              },
              {
                menuItem: {
                  isCook: false,
                },
                status: {
                  in: ["pending", "preparing", "ready"],
                },
              },
            ],
            status: status
              ? status
              : {
                  notIn: ["served", "cancelled"],
                },
          },
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

    return successResponse(
      { items: orders },
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

export const GET = withAuth(handler, ["admin", "order"]);
