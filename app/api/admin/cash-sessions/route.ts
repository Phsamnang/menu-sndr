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
      where.openedAt = {};
      if (startDate) {
        where.openedAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.openedAt.lte = end;
      }
    }

    const sessions = await prisma.cashSession.findMany({
      where,
      include: {
        shift: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { openedAt: "desc" },
    });

    return successResponse(sessions, "Cash sessions fetched successfully");
  } catch (error: any) {
    console.error("Error fetching cash sessions:", error);
    return errorResponse(
      "FETCH_CASH_SESSIONS_ERROR",
      "Failed to fetch cash sessions",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { shiftId, userId, openingBalance, sessionNumber } = body;

    if (!userId || openingBalance === undefined) {
      return errorResponse(
        "VALIDATION_ERROR",
        "userId and openingBalance are required",
        400,
        [
          ...(!userId ? [{ field: "userId", message: "User is required" }] : []),
          ...(openingBalance === undefined
            ? [{ field: "openingBalance", message: "Opening balance is required" }]
            : []),
        ]
      );
    }

    const session = await prisma.cashSession.create({
      data: {
        shiftId: shiftId || null,
        userId,
        sessionNumber: sessionNumber || `CS-${Date.now()}`,
        openingBalance,
        status: "open",
      },
      include: {
        shift: {
          include: {
            user: true,
          },
        },
      },
    });

    return successResponse(session, "Cash session created successfully", 201);
  } catch (error: any) {
    console.error("Error creating cash session:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Cash session with this number already exists",
        409,
        [{ field: "sessionNumber", message: "Session number must be unique" }]
      );
    }
    return errorResponse(
      "CREATE_CASH_SESSION_ERROR",
      "Failed to create cash session",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

