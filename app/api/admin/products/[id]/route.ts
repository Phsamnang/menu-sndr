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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        unit: true,
      },
    });

    if (!product) {
      return errorResponse(
        "NOT_FOUND",
        "Product not found",
        404,
        [{ message: "Product with this ID does not exist" }]
      );
    }

    return successResponse(product, "Product fetched successfully");
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return errorResponse(
      "FETCH_PRODUCT_ERROR",
      "Failed to fetch product",
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
    const { name, description, unitId, category, isActive } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return errorResponse(
        "NOT_FOUND",
        "Product not found",
        404,
        [{ message: "Product with this ID does not exist" }]
      );
    }

    if (name && name !== existingProduct.name) {
      const duplicate = await prisma.product.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (duplicate) {
        return errorResponse(
          "DUPLICATE_ENTRY",
          "Product with this name already exists",
          409,
          [{ field: "name", message: "Product name must be unique" }]
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (unitId !== undefined) updateData.unitId = unitId || null;
    if (category !== undefined) updateData.category = category || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        unit: true,
      },
    });

    return successResponse(product, "Product updated successfully");
  } catch (error: any) {
    console.error("Error updating product:", error);
    return errorResponse(
      "UPDATE_PRODUCT_ERROR",
      "Failed to update product",
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

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return errorResponse(
        "NOT_FOUND",
        "Product not found",
        404,
        [{ message: "Product with this ID does not exist" }]
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return successResponse(null, "Product deleted successfully");
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return errorResponse(
      "DELETE_PRODUCT_ERROR",
      "Failed to delete product",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);

