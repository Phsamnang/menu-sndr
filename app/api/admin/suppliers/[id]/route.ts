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
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        expenses: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!supplier) {
      return errorResponse(
        "NOT_FOUND",
        "Supplier not found",
        404,
        [{ message: "Supplier with this ID does not exist" }]
      );
    }

    return successResponse(supplier, "Supplier fetched successfully");
  } catch (error: any) {
    console.error("Error fetching supplier:", error);
    return errorResponse(
      "FETCH_SUPPLIER_ERROR",
      "Failed to fetch supplier",
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

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return errorResponse(
        "NOT_FOUND",
        "Supplier not found",
        404,
        [{ message: "Supplier with this ID does not exist" }]
      );
    }

    if (name && name !== existingSupplier.name) {
      const duplicate = await prisma.supplier.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (duplicate) {
        return errorResponse(
          "DUPLICATE_ENTRY",
          "Supplier with this name already exists",
          409,
          [{ field: "name", message: "Supplier name must be unique" }]
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (contactName !== undefined) updateData.contactName = contactName || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (email !== undefined) updateData.email = email || null;
    if (address !== undefined) updateData.address = address || null;
    if (taxId !== undefined) updateData.taxId = taxId || null;
    if (category !== undefined) updateData.category = category || null;
    if (paymentTerms !== undefined) updateData.paymentTerms = paymentTerms || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
    });

    return successResponse(supplier, "Supplier updated successfully");
  } catch (error: any) {
    console.error("Error updating supplier:", error);
    return errorResponse(
      "UPDATE_SUPPLIER_ERROR",
      "Failed to update supplier",
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

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return errorResponse(
        "NOT_FOUND",
        "Supplier not found",
        404,
        [{ message: "Supplier with this ID does not exist" }]
      );
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return successResponse(null, "Supplier deleted successfully");
  } catch (error: any) {
    console.error("Error deleting supplier:", error);
    return errorResponse(
      "DELETE_SUPPLIER_ERROR",
      "Failed to delete supplier",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);


