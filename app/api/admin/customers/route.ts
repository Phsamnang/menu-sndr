import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search");
    const isVip = searchParams.get("isVip");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (isVip !== null) {
      where.isVip = isVip === "true";
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return successResponse(
      {
        items: customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      "Customers fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return errorResponse("FETCH_CUSTOMERS_ERROR", "Failed to fetch customers", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
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

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        birthday: birthday ? new Date(birthday) : null,
        address: address || null,
        notes: notes || null,
        isVip: isVip ?? false,
      },
    });

    return successResponse(customer, "Customer created successfully", 201);
  } catch (error: any) {
    console.error("Error creating customer:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Customer with this phone already exists",
        409,
        [{ field: "phone", message: "Phone must be unique" }]
      );
    }
    return errorResponse("CREATE_CUSTOMER_ERROR", "Failed to create customer", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

