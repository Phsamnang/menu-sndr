import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    });
    return successResponse(roles, "Roles fetched successfully");
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    return errorResponse(
      "FETCH_ROLES_ERROR",
      "Failed to fetch roles",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);

