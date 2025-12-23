import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function handler(request: AuthenticatedRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return successResponse(categories, "Categories fetched successfully");
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return errorResponse(
      "FETCH_CATEGORIES_ERROR",
      "Failed to fetch categories",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(handler);
