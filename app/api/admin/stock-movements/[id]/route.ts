import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movement = await prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            unit: true,
          },
        },
        unit: true,
      },
    });

    if (!movement) {
      return errorResponse("NOT_FOUND", "Stock movement not found", 404);
    }

    return successResponse(movement, "Stock movement fetched successfully");
  } catch (error: any) {
    console.error("Error fetching stock movement:", error);
    return errorResponse(
      "FETCH_STOCK_MOVEMENT_ERROR",
      "Failed to fetch stock movement",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => getHandler(req, context), ["admin"])(request);
}

