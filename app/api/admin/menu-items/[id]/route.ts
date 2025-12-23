import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

interface Price {
  tableTypeId: string;
  amount: number;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, image, categoryId, prices, isCook } = body;

    if (!name || !image || !categoryId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Name, image, and categoryId are required",
        400,
        [
          ...(!name ? [{ field: "name", message: "Name is required" }] : []),
          ...(!image ? [{ field: "image", message: "Image is required" }] : []),
          ...(!categoryId
            ? [{ field: "categoryId", message: "CategoryId is required" }]
            : []),
        ]
      );
    }

    const existingItem = await prisma.menuItem.findFirst({
      where: {
        name,
        categoryId,
        id: { not: id },
      },
    });

    if (existingItem) {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Menu item with this name already exists in this category",
        409,
        [
          {
            field: "name",
            message: "Menu item name must be unique within category",
          },
        ]
      );
    }

    await prisma.price.deleteMany({
      where: { menuItemId: id },
    });

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description: description || "",
        image,
        categoryId,
        isCook: isCook ?? false,
      },
      include: {
        category: true,
        prices: {
          include: {
            tableType: true,
          },
        },
      },
    });

    if (prices && prices.length > 0) {
      await prisma.price.createMany({
        data: prices.map((price: Price) => ({
          menuItemId: id,
          tableTypeId: price.tableTypeId,
          amount: price.amount,
        })),
      });
    }

    const updatedMenuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        prices: {
          include: {
            tableType: true,
          },
        },
      },
    });

    return successResponse(updatedMenuItem, "Menu item updated successfully");
  } catch (error: any) {
    console.error("Error updating menu item:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Menu item not found", 404);
    }
    if (error?.code === "P2003") {
      return errorResponse(
        "INVALID_REFERENCE",
        "Invalid category reference",
        400,
        [{ field: "categoryId", message: "Category does not exist" }]
      );
    }
    return errorResponse(
      "UPDATE_MENU_ITEM_ERROR",
      "Failed to update menu item",
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
    await prisma.menuItem.delete({
      where: { id },
    });

    return successResponse(null, "Menu item deleted successfully");
  } catch (error: any) {
    console.error("Error deleting menu item:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Menu item not found", 404);
    }
    return errorResponse(
      "DELETE_MENU_ITEM_ERROR",
      "Failed to delete menu item",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}
