import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const itemStatusFilter = status ? [status] : ["pending", "preparing"];

    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["new", "on_process"],
        },
        items: {
          some: {
            menuItem: {
              isCook: true,
            },
            status: {
              in: itemStatusFilter,
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
            menuItem: {
              isCook: true,
            },
            status: {
              in: itemStatusFilter,
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
