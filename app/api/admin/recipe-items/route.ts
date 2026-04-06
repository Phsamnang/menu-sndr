import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get("menuItemId");
    const productId = searchParams.get("productId");

    const where: any = {};

    if (menuItemId) {
      where.menuItemId = menuItemId;
    }

    if (productId) {
      where.productId = productId;
    }

    const recipeItems = await prisma.recipeItem.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ items: recipeItems, total: recipeItems.length }, "Recipe items fetched successfully");
  } catch (error: any) {
    console.error("Error fetching recipe items:", error);
    return errorResponse(
      "FETCH_RECIPE_ITEMS_ERROR",
      "Failed to fetch recipe items",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { menuItemId, productId, quantity, notes } = body;

    if (!menuItemId || !productId || quantity === undefined) {
      return errorResponse(
        "VALIDATION_ERROR",
        "menuItemId, productId, and quantity are required",
        400,
        [
          ...(!menuItemId
            ? [{ field: "menuItemId", message: "Menu item is required" }]
            : []),
          ...(!productId
            ? [{ field: "productId", message: "Product is required" }]
            : []),
          ...(quantity === undefined
            ? [{ field: "quantity", message: "Quantity is required" }]
            : []),
        ]
      );
    }

    if (quantity <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Quantity must be greater than 0",
        400,
        [{ field: "quantity", message: "Quantity must be positive" }]
      );
    }

    const recipeItem = await prisma.recipeItem.create({
      data: {
        menuItemId,
        productId,
        quantity,
        notes: notes || null,
      },
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

    return successResponse(recipeItem, "Recipe item created successfully", 201);
  } catch (error: any) {
    console.error("Error creating recipe item:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Recipe item for this menu item and product already exists",
        409,
        [
          {
            field: "menuItemId",
            message: "Recipe item already exists for this combination",
          },
        ]
      );
    }
    return errorResponse(
      "CREATE_RECIPE_ITEM_ERROR",
      "Failed to create recipe item",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

