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
    const { number, name, capacity, tableTypeId, status } = body;

    if (!number || !tableTypeId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Number and tableTypeId are required",
        400,
        [
          ...(!number
            ? [{ field: "number", message: "Number is required" }]
            : []),
          ...(!tableTypeId
            ? [{ field: "tableTypeId", message: "TableTypeId is required" }]
            : []),
        ]
      );
    }

    const table = await prisma.table.update({
      where: { id },
      data: {
        number,
        name: name || null,
        capacity: capacity || 4,
        tableTypeId,
        status: status || "available",
      },
      include: {
        tableType: true,
      },
    });

    return successResponse(table, "Table updated successfully");
  } catch (error: any) {
    console.error("Error updating table:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Table not found", 404);
    }
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Table with this number already exists",
        409,
        [{ field: "number", message: "Table number must be unique" }]
      );
    }
    if (error?.code === "P2003") {
      return errorResponse(
        "INVALID_REFERENCE",
        "Invalid table type reference",
        400,
        [{ field: "tableTypeId", message: "Table type does not exist" }]
      );
    }
    return errorResponse("UPDATE_TABLE_ERROR", "Failed to update table", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.table.delete({
      where: { id },
    });

    return successResponse(null, "Table deleted successfully");
  } catch (error: any) {
    console.error("Error deleting table:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Table not found", 404);
    }
    return errorResponse("DELETE_TABLE_ERROR", "Failed to delete table", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}
