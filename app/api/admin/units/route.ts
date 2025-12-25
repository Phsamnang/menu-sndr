import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const where: any = {};

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const units = await prisma.unit.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    return successResponse(units, "Units fetched successfully");
  } catch (error: any) {
    console.error("Error fetching units:", error);
    return errorResponse(
      "FETCH_UNITS_ERROR",
      "Failed to fetch units",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { name, displayName, symbol, order } = body;

    if (!name || !displayName) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Name and displayName are required",
        400,
        [
          ...(!name ? [{ field: "name", message: "Name is required" }] : []),
          ...(!displayName
            ? [{ field: "displayName", message: "DisplayName is required" }]
            : []),
        ]
      );
    }

    const unit = await prisma.unit.create({
      data: {
        name,
        displayName,
        symbol: symbol || null,
        order: order || 0,
      },
    });

    return successResponse(unit, "Unit created successfully", 201);
  } catch (error: any) {
    console.error("Error creating unit:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Unit with this name already exists",
        409,
        [{ field: "name", message: "Unit name must be unique" }]
      );
    }
    return errorResponse(
      "CREATE_UNIT_ERROR",
      "Failed to create unit",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

