import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const tables = await prisma.table.findMany({
      include: {
        tableType: true,
      },
      orderBy: { number: "asc" },
    });
    return successResponse(tables, "Tables fetched successfully");
  } catch (error: any) {
    console.error("Error fetching tables:", error);
    return errorResponse("FETCH_TABLES_ERROR", "Failed to fetch tables", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
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

    const table = await prisma.table.create({
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

    return successResponse(table, "Table created successfully", 201);
  } catch (error: any) {
    console.error("Error creating table:", error);
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
    return errorResponse("CREATE_TABLE_ERROR", "Failed to create table", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);
