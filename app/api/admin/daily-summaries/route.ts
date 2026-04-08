import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const summaries = await prisma.dailySummary.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return successResponse({ items: summaries, total: summaries.length }, "Daily summaries fetched successfully");
  } catch (error: any) {
    console.error("Error fetching daily summaries:", error);
    return errorResponse(
      "FETCH_DAILY_SUMMARIES_ERROR",
      "Failed to fetch daily summaries",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return errorResponse(
        "VALIDATION_ERROR",
        "date is required",
        400,
        [{ field: "date", message: "Date is required" }]
      );
    }

    // Check if summary already exists for this date
    const existing = await prisma.dailySummary.findUnique({
      where: { date: new Date(date) },
    });

    if (existing) {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Daily summary for this date already exists",
        409,
        [{ field: "date", message: "Summary already exists for this date" }]
      );
    }

    // Calculate summary from orders and expenses
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dateFilter = { gte: startOfDay, lte: endOfDay };

    const [orderAgg, expenseAgg, topItemResult] = await Promise.all([
      // Aggregate orders instead of fetching all rows
      prisma.order.aggregate({
        where: {
          createdAt: dateFilter,
          status: { not: "cancelled" },
        },
        _sum: { grandTotal: true },
        _count: true,
      }),
      // Aggregate expenses instead of fetching all rows
      prisma.expense.aggregate({
        where: { date: dateFilter },
        _sum: { amountUSD: true },
      }),
      // Find top menu item with a single grouped query
      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        where: {
          order: {
            createdAt: dateFilter,
            status: { not: "cancelled" },
          },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 1,
      }),
    ]);

    const totalOrders = orderAgg._count;
    const totalRevenue = orderAgg._sum.grandTotal || 0;
    const totalExpenses = expenseAgg._sum.amountUSD || 0;
    const netProfit = totalRevenue - totalExpenses;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    let topMenuItem = null;
    if (topItemResult.length > 0) {
      topMenuItem = await prisma.menuItem.findUnique({
        where: { id: topItemResult[0].menuItemId },
        select: { name: true },
      });
    }

    const summary = await prisma.dailySummary.create({
      data: {
        date: targetDate,
        totalOrders,
        totalRevenue,
        totalExpenses,
        netProfit,
        avgOrderValue,
        topMenuItem: topMenuItem?.name || null,
        currency: "USD",
      },
    });

    return successResponse(summary, "Daily summary created successfully", 201);
  } catch (error: any) {
    console.error("Error creating daily summary:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Daily summary for this date already exists",
        409,
        [{ field: "date", message: "Summary already exists for this date" }]
      );
    }
    return errorResponse(
      "CREATE_DAILY_SUMMARY_ERROR",
      "Failed to create daily summary",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

