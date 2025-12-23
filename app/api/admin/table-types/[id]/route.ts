import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, displayName, order } = body;

    if (!name || !displayName) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Name and displayName are required",
        400,
        [
          ...(!name ? [{ field: "name", message: "Name is required" }] : []),
          ...(!displayName ? [{ field: "displayName", message: "DisplayName is required" }] : []),
        ]
      );
    }

    const tableType = await prisma.tableType.update({
      where: { id },
      data: { name, displayName, order },
    });

    return successResponse(tableType, "Table type updated successfully");
  } catch (error: any) {
    console.error("Error updating table type:", error);
    if (error?.code === "P2025") {
      return errorResponse(
        "NOT_FOUND",
        "Table type not found",
        404
      );
    }
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Table type with this name already exists",
        409,
        [{ field: "name", message: "Table type name must be unique" }]
      );
    }
    return errorResponse(
      "UPDATE_TABLE_TYPE_ERROR",
      "Failed to update table type",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.tableType.delete({
      where: { id },
    });

    return successResponse(null, "Table type deleted successfully");
  } catch (error: any) {
    console.error("Error deleting table type:", error);
    if (error?.code === "P2025") {
      return errorResponse(
        "NOT_FOUND",
        "Table type not found",
        404
      );
    }
    if (error?.code === "P2003") {
      return errorResponse(
        "CONSTRAINT_ERROR",
        "Cannot delete table type with associated prices",
        409
      );
    }
    return errorResponse(
      "DELETE_TABLE_TYPE_ERROR",
      "Failed to delete table type",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

