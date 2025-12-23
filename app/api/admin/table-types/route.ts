import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function GET() {
  try {
    const tableTypes = await prisma.tableType.findMany({
      orderBy: { order: "asc" },
    });
    return successResponse(tableTypes, "Table types fetched successfully");
  } catch (error: any) {
    console.error("Error fetching table types:", error);
    return errorResponse(
      "FETCH_TABLE_TYPES_ERROR",
      "Failed to fetch table types",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const tableType = await prisma.tableType.create({
      data: { name, displayName, order: order || 0 },
    });

    return successResponse(tableType, "Table type created successfully", 201);
  } catch (error: any) {
    console.error("Error creating table type:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Table type with this name already exists",
        409,
        [{ field: "name", message: "Table type name must be unique" }]
      );
    }
    return errorResponse(
      "CREATE_TABLE_TYPE_ERROR",
      "Failed to create table type",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

