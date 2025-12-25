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
    const unit = await prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) {
      return errorResponse(
        "NOT_FOUND",
        "Unit not found",
        404,
        [{ message: "Unit with this ID does not exist" }]
      );
    }

    return successResponse(unit, "Unit fetched successfully");
  } catch (error: any) {
    console.error("Error fetching unit:", error);
    return errorResponse(
      "FETCH_UNIT_ERROR",
      "Failed to fetch unit",
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
    const { name, displayName, symbol, order, isActive } = body;

    const existingUnit = await prisma.unit.findUnique({
      where: { id },
    });

    if (!existingUnit) {
      return errorResponse(
        "NOT_FOUND",
        "Unit not found",
        404,
        [{ message: "Unit with this ID does not exist" }]
      );
    }

    if (name && name !== existingUnit.name) {
      const duplicate = await prisma.unit.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (duplicate) {
        return errorResponse(
          "DUPLICATE_ENTRY",
          "Unit with this name already exists",
          409,
          [{ field: "name", message: "Unit name must be unique" }]
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (symbol !== undefined) updateData.symbol = symbol || null;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const unit = await prisma.unit.update({
      where: { id },
      data: updateData,
    });

    return successResponse(unit, "Unit updated successfully");
  } catch (error: any) {
    console.error("Error updating unit:", error);
    return errorResponse(
      "UPDATE_UNIT_ERROR",
      "Failed to update unit",
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

    const existingUnit = await prisma.unit.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!existingUnit) {
      return errorResponse(
        "NOT_FOUND",
        "Unit not found",
        404,
        [{ message: "Unit with this ID does not exist" }]
      );
    }

    if (existingUnit.products.length > 0) {
      return errorResponse(
        "IN_USE",
        "Cannot delete unit that is being used by products",
        400,
        [
          {
            message: `This unit is used by ${existingUnit.products.length} product(s)`,
          },
        ]
      );
    }

    await prisma.unit.delete({
      where: { id },
    });

    return successResponse(null, "Unit deleted successfully");
  } catch (error: any) {
    console.error("Error deleting unit:", error);
    return errorResponse(
      "DELETE_UNIT_ERROR",
      "Failed to delete unit",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);

