import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.shiftDate = {};
      if (startDate) {
        where.shiftDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.shiftDate.lte = end;
      }
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        user: {
          include: {
            role: true,
          },
        },
        sessions: true,
      },
      orderBy: { shiftDate: "desc" },
    });

    return successResponse({ items: shifts, total: shifts.length }, "Shifts fetched successfully");
  } catch (error: any) {
    console.error("Error fetching shifts:", error);
    return errorResponse(
      "FETCH_SHIFTS_ERROR",
      "Failed to fetch shifts",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { userId, shiftDate, clockIn, breakMinutes, notes } = body;

    if (!userId || !shiftDate || !clockIn) {
      return errorResponse(
        "VALIDATION_ERROR",
        "userId, shiftDate, and clockIn are required",
        400,
        [
          ...(!userId ? [{ field: "userId", message: "User is required" }] : []),
          ...(!shiftDate
            ? [{ field: "shiftDate", message: "Shift date is required" }]
            : []),
          ...(!clockIn
            ? [{ field: "clockIn", message: "Clock in time is required" }]
            : []),
        ]
      );
    }

    const shift = await prisma.shift.create({
      data: {
        userId,
        shiftDate: new Date(shiftDate),
        clockIn: new Date(clockIn),
        breakMinutes: breakMinutes || 0,
        notes: notes || null,
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    return successResponse(shift, "Shift created successfully", 201);
  } catch (error: any) {
    console.error("Error creating shift:", error);
    return errorResponse(
      "CREATE_SHIFT_ERROR",
      "Failed to create shift",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

