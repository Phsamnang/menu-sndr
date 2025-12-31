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
    const recipeItem = await prisma.recipeItem.findUnique({
      where: { id },
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
        product: {
          include: {
            baseUnit: true,
          },
        },
      },
    });

    if (!recipeItem) {
      return errorResponse(
        "NOT_FOUND",
        "Recipe item not found",
        404,
        [{ message: "Recipe item with this ID does not exist" }]
      );
    }

    return successResponse(recipeItem, "Recipe item fetched successfully");
  } catch (error: any) {
    console.error("Error fetching recipe item:", error);
    return errorResponse(
      "FETCH_RECIPE_ITEM_ERROR",
      "Failed to fetch recipe item",
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
    const { quantity, notes } = body;

    const existingRecipeItem = await prisma.recipeItem.findUnique({
      where: { id },
    });

    if (!existingRecipeItem) {
      return errorResponse(
        "NOT_FOUND",
        "Recipe item not found",
        404,
        [{ message: "Recipe item with this ID does not exist" }]
      );
    }

    const updateData: any = {};
    if (quantity !== undefined) {
      if (quantity <= 0) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Quantity must be greater than 0",
          400,
          [{ field: "quantity", message: "Quantity must be positive" }]
        );
      }
      updateData.quantity = quantity;
    }
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    const recipeItem = await prisma.recipeItem.update({
      where: { id },
      data: updateData,
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
        product: {
          include: {
            baseUnit: true,
          },
        },
      },
    });

    return successResponse(recipeItem, "Recipe item updated successfully");
  } catch (error: any) {
    console.error("Error updating recipe item:", error);
    return errorResponse(
      "UPDATE_RECIPE_ITEM_ERROR",
      "Failed to update recipe item",
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

    const existingRecipeItem = await prisma.recipeItem.findUnique({
      where: { id },
    });

    if (!existingRecipeItem) {
      return errorResponse(
        "NOT_FOUND",
        "Recipe item not found",
        404,
        [{ message: "Recipe item with this ID does not exist" }]
      );
    }

    await prisma.recipeItem.delete({
      where: { id },
    });

    return successResponse(null, "Recipe item deleted successfully");
  } catch (error: any) {
    console.error("Error deleting recipe item:", error);
    return errorResponse(
      "DELETE_RECIPE_ITEM_ERROR",
      "Failed to delete recipe item",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);

