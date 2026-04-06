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

    const [orders, expenses] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { not: "cancelled" },
        },
        include: {
          items: {
            select: {
              menuItemId: true,
              quantity: true,
            },
          },
        },
      }),
      prisma.expense.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.grandTotal, 0);
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + (expense.amountUSD || 0),
      0
    );
    const netProfit = totalRevenue - totalExpenses;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Find top menu item
    const menuItemCounts: Record<string, number> = {};
    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const menuItemId = item.menuItemId;
          if (menuItemId) {
            menuItemCounts[menuItemId] = (menuItemCounts[menuItemId] || 0) + (item.quantity || 0);
          }
        });
      }
    });

    let topMenuItem = null;
    const menuItemKeys = Object.keys(menuItemCounts);
    if (menuItemKeys.length > 0) {
      const topMenuItemId = menuItemKeys.reduce((a, b) =>
        menuItemCounts[a] > menuItemCounts[b] ? a : b
      );
      
      topMenuItem = await prisma.menuItem.findUnique({
        where: { id: topMenuItemId },
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

