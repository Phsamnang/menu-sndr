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
    const conversion = await prisma.unitConversion.findUnique({
      where: { id },
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });

    if (!conversion) {
      return errorResponse(
        "NOT_FOUND",
        "Unit conversion not found",
        404,
        [{ message: "Unit conversion with this ID does not exist" }]
      );
    }

    return successResponse(conversion, "Unit conversion fetched successfully");
  } catch (error: any) {
    console.error("Error fetching unit conversion:", error);
    return errorResponse(
      "FETCH_CONVERSION_ERROR",
      "Failed to fetch unit conversion",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { conversionRate, description } = body;

    const existingConversion = await prisma.unitConversion.findUnique({
      where: { id },
    });

    if (!existingConversion) {
      return errorResponse(
        "NOT_FOUND",
        "Unit conversion not found",
        404,
        [{ message: "Unit conversion with this ID does not exist" }]
      );
    }

    const updateData: any = {};
    if (conversionRate !== undefined) {
      if (conversionRate <= 0) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Conversion rate must be greater than 0",
          400,
          [{ field: "conversionRate", message: "Conversion rate must be positive" }]
        );
      }
      updateData.conversionRate = conversionRate;
    }
    if (description !== undefined) {
      updateData.description = description || null;
    }

    const conversion = await prisma.unitConversion.update({
      where: { id },
      data: updateData,
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });

    return successResponse(conversion, "Unit conversion updated successfully");
  } catch (error: any) {
    console.error("Error updating unit conversion:", error);
    return errorResponse(
      "UPDATE_CONVERSION_ERROR",
      "Failed to update unit conversion",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingConversion = await prisma.unitConversion.findUnique({
      where: { id },
    });

    if (!existingConversion) {
      return errorResponse(
        "NOT_FOUND",
        "Unit conversion not found",
        404,
        [{ message: "Unit conversion with this ID does not exist" }]
      );
    }

    await prisma.unitConversion.delete({
      where: { id },
    });

    return successResponse(null, "Unit conversion deleted successfully");
  } catch (error: any) {
    console.error("Error deleting unit conversion:", error);
    return errorResponse(
      "DELETE_CONVERSION_ERROR",
      "Failed to delete unit conversion",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);

