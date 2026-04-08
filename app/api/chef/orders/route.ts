import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

const KITCHEN_ITEM_STATUSES = ["pending", "preparing", "ready"] as const;

async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const itemStatusFilter =
      status && (KITCHEN_ITEM_STATUSES as readonly string[]).includes(status)
        ? [status]
        : [...KITCHEN_ITEM_STATUSES];

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
          select: {
            id: true,
            number: true,
            name: true,
            tableType: { select: { id: true, name: true, displayName: true } },
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
              select: {
                id: true,
                name: true,
                image: true,
                isCook: true,
                category: { select: { name: true, displayName: true } },
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
