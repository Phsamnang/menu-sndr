import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, displayName } = body;

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

    const category = await prisma.category.update({
      where: { id },
      data: { name, displayName },
    });

    return successResponse(category, "Category updated successfully");
  } catch (error: any) {
    console.error("Error updating category:", error);
    if (error?.code === "P2025") {
      return errorResponse(
        "NOT_FOUND",
        "Category not found",
        404
      );
    }
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Category with this name already exists",
        409,
        [{ field: "name", message: "Category name must be unique" }]
      );
    }
    return errorResponse(
      "UPDATE_CATEGORY_ERROR",
      "Failed to update category",
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
    await prisma.category.delete({
      where: { id },
    });

    return successResponse(null, "Category deleted successfully");
  } catch (error: any) {
    console.error("Error deleting category:", error);
    if (error?.code === "P2025") {
      return errorResponse(
        "NOT_FOUND",
        "Category not found",
        404
      );
    }
    if (error?.code === "P2003") {
      return errorResponse(
        "CONSTRAINT_ERROR",
        "Cannot delete category with associated menu items",
        409
      );
    }
    return errorResponse(
      "DELETE_CATEGORY_ERROR",
      "Failed to delete category",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => putHandler(req, context), ["admin"])(request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => deleteHandler(req, context), ["admin"])(request);
}

