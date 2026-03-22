import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

function dayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { start, end } = dayBounds();

    const [
      todayAgg,
      totalCompleted,
      availableTables,
      usersCount,
      activeOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: "completed",
          completedAt: { gte: start, lte: end },
        },
        _sum: { grandTotal: true },
      }),
      prisma.order.count({ where: { status: "completed" } }),
      prisma.table.count({ where: { status: "available" } }),
      prisma.user.count(),
      prisma.order.count({
        where: {
          status: { notIn: ["completed", "cancelled"] },
        },
      }),
    ]);

    return successResponse(
      {
        todayRevenue: todayAgg._sum.grandTotal ?? 0,
        totalCompletedOrders: totalCompleted,
        availableTables,
        usersCount,
        activeOrders,
      },
      "Dashboard stats fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return errorResponse(
      "DASHBOARD_STATS_ERROR",
      "Failed to fetch dashboard stats",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function GET(request: NextRequest) {
  return withAuth((req) => getHandler(req))(request);
}
