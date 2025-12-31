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
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        reservations: {
          orderBy: { reservedDate: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return errorResponse("NOT_FOUND", "Customer not found", 404);
    }

    return successResponse(customer, "Customer fetched successfully");
  } catch (error: any) {
    console.error("Error fetching customer:", error);
    return errorResponse("FETCH_CUSTOMER_ERROR", "Failed to fetch customer", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, email, birthday, address, notes, isVip } = body;

    if (!name || !phone) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Name and phone are required",
        400,
        [
          ...(!name ? [{ field: "name", message: "Name is required" }] : []),
          ...(!phone ? [{ field: "phone", message: "Phone is required" }] : []),
        ]
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        phone,
        email: email !== undefined ? email : undefined,
        birthday: birthday ? new Date(birthday) : undefined,
        address: address !== undefined ? address : undefined,
        notes: notes !== undefined ? notes : undefined,
        isVip: isVip !== undefined ? isVip : undefined,
      },
    });

    return successResponse(customer, "Customer updated successfully");
  } catch (error: any) {
    console.error("Error updating customer:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Customer not found", 404);
    }
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Customer with this phone already exists",
        409,
        [{ field: "phone", message: "Phone must be unique" }]
      );
    }
    return errorResponse("UPDATE_CUSTOMER_ERROR", "Failed to update customer", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.customer.delete({
      where: { id },
    });

    return successResponse(null, "Customer deleted successfully");
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Customer not found", 404);
    }
    return errorResponse("DELETE_CUSTOMER_ERROR", "Failed to delete customer", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => getHandler(req, context), ["admin"])(request);
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

