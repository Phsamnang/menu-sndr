import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      status: "completed",
    };

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

    const stats = await prisma.payment.groupBy({
      by: ["method"],
      where,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const items = stats.map((stat) => ({
      method: stat.method,
      totalAmount: stat._sum.amount || 0,
      count: stat._count,
    }));

    return successResponse(
      { items, total: items.length },
      "Payment stats fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching payment stats:", error);
    return errorResponse(
      "FETCH_PAYMENT_STATS_ERROR",
      "Failed to fetch payment stats",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
