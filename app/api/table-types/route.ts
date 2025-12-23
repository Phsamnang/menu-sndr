import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const tableTypes = await prisma.tableType.findMany({
      orderBy: {
        order: "asc",
      },
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
