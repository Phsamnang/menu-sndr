import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const category = searchParams.get("category");

    const where: any = {};

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (category) {
      where.category = category;
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return successResponse(suppliers, "Suppliers fetched successfully");
  } catch (error: any) {
    console.error("Error fetching suppliers:", error);
    return errorResponse(
      "FETCH_SUPPLIERS_ERROR",
      "Failed to fetch suppliers",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const {
      name,
      contactName,
      phone,
      email,
      address,
      taxId,
      category,
      paymentTerms,
      notes,
      isActive,
    } = body;

    if (!name) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Name is required",
        400,
        [{ field: "name", message: "Name is required" }]
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName: contactName || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        taxId: taxId || null,
        category: category || null,
        paymentTerms: paymentTerms || null,
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return successResponse(supplier, "Supplier created successfully", 201);
  } catch (error: any) {
    console.error("Error creating supplier:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Supplier with this name already exists",
        409,
        [{ field: "name", message: "Supplier name must be unique" }]
      );
    }
    return errorResponse(
      "CREATE_SUPPLIER_ERROR",
      "Failed to create supplier",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);


