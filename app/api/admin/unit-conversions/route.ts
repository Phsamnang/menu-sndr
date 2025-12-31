import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromUnitId = searchParams.get("fromUnitId");
    const toUnitId = searchParams.get("toUnitId");

    const where: any = {};

    if (fromUnitId) {
      where.fromUnitId = fromUnitId;
    }

    if (toUnitId) {
      where.toUnitId = toUnitId;
    }

    const conversions = await prisma.unitConversion.findMany({
      where,
      include: {
        fromUnit: true,
        toUnit: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(conversions, "Unit conversions fetched successfully");
  } catch (error: any) {
    console.error("Error fetching unit conversions:", error);
    return errorResponse(
      "FETCH_CONVERSIONS_ERROR",
      "Failed to fetch unit conversions",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { fromUnitId, toUnitId, conversionRate, description } = body;

    if (!fromUnitId || !toUnitId || !conversionRate) {
      return errorResponse(
        "VALIDATION_ERROR",
        "fromUnitId, toUnitId, and conversionRate are required",
        400,
        [
          ...(!fromUnitId
            ? [{ field: "fromUnitId", message: "From unit is required" }]
            : []),
          ...(!toUnitId
            ? [{ field: "toUnitId", message: "To unit is required" }]
            : []),
          ...(!conversionRate
            ? [
                {
                  field: "conversionRate",
                  message: "Conversion rate is required",
                },
              ]
            : []),
        ]
      );
    }

    if (fromUnitId === toUnitId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "From unit and to unit cannot be the same",
        400,
        [{ field: "toUnitId", message: "To unit must be different from from unit" }]
      );
    }

    if (conversionRate <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Conversion rate must be greater than 0",
        400,
        [{ field: "conversionRate", message: "Conversion rate must be positive" }]
      );
    }

    const conversion = await prisma.unitConversion.create({
      data: {
        fromUnitId,
        toUnitId,
        conversionRate,
        description: description || null,
      },
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });

    return successResponse(conversion, "Unit conversion created successfully", 201);
  } catch (error: any) {
    console.error("Error creating unit conversion:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Conversion between these units already exists",
        409,
        [
          {
            field: "fromUnitId",
            message: "Conversion already exists for these units",
          },
        ]
      );
    }
    return errorResponse(
      "CREATE_CONVERSION_ERROR",
      "Failed to create unit conversion",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

