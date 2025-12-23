import { NextRequest } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

async function handler(request: AuthenticatedRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.userId },
      include: { role: true },
      select: {
        id: true,
        username: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(
        "USER_NOT_FOUND",
        "User not found",
        404,
        [{ message: "User not found" }]
      );
    }

    return successResponse(user, "User retrieved successfully");
  } catch (error: any) {
    console.error("Get user error:", error);
    return errorResponse(
      "GET_USER_ERROR",
      "Failed to get user",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(handler);

