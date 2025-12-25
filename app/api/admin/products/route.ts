import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        unit: true,
      },
      orderBy: { name: "asc" },
    });

    return successResponse(products, "Products fetched successfully");
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return errorResponse(
      "FETCH_PRODUCTS_ERROR",
      "Failed to fetch products",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { name, description, unitId, category } = body;

    if (!name) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Name is required",
        400,
        [{ field: "name", message: "Name is required" }]
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        unitId: unitId || null,
        category: category || null,
      },
      include: {
        unit: true,
      },
    });

    return successResponse(product, "Product created successfully", 201);
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Product with this name already exists",
        409,
        [{ field: "name", message: "Product name must be unique" }]
      );
    }
    return errorResponse(
      "CREATE_PRODUCT_ERROR",
      "Failed to create product",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

