import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return successResponse(categories, "Categories fetched successfully");
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return errorResponse(
      "FETCH_CATEGORIES_ERROR",
      "Failed to fetch categories",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName } = body;

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

    const category = await prisma.category.create({
      data: { name, displayName },
    });

    return successResponse(category, "Category created successfully", 201);
  } catch (error: any) {
    console.error("Error creating category:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Category with this name already exists",
        409,
        [{ field: "name", message: "Category name must be unique" }]
      );
    }
    return errorResponse(
      "CREATE_CATEGORY_ERROR",
      "Failed to create category",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}
