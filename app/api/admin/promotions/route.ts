import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const type = searchParams.get("type");

    const where: any = {};

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (type) {
      where.type = type;
    }

    // Filter by date range if needed
    const now = new Date();
    if (isActive === "true") {
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    }

    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ items: promotions, total: promotions.length }, "Promotions fetched successfully");
  } catch (error: any) {
    console.error("Error fetching promotions:", error);
    return errorResponse(
      "FETCH_PROMOTIONS_ERROR",
      "Failed to fetch promotions",
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
      description,
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      startDate,
      endDate,
      startTime,
      endTime,
      applicableDays,
      usageLimit,
    } = body;

    if (!name || !type || !value || !startDate || !endDate) {
      return errorResponse(
        "VALIDATION_ERROR",
        "name, type, value, startDate, and endDate are required",
        400,
        [
          ...(!name ? [{ field: "name", message: "Name is required" }] : []),
          ...(!type ? [{ field: "type", message: "Type is required" }] : []),
          ...(value === undefined
            ? [{ field: "value", message: "Value is required" }]
            : []),
          ...(!startDate
            ? [{ field: "startDate", message: "Start date is required" }]
            : []),
          ...(!endDate
            ? [{ field: "endDate", message: "End date is required" }]
            : []),
        ]
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return errorResponse(
        "VALIDATION_ERROR",
        "End date must be after start date",
        400,
        [{ field: "endDate", message: "End date must be after start date" }]
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description: description || null,
        code: code || null,
        type,
        value,
        minOrderAmount: minOrderAmount || null,
        maxDiscount: maxDiscount || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime: startTime || null,
        endTime: endTime || null,
        applicableDays: applicableDays ? JSON.stringify(applicableDays) : null,
        usageLimit: usageLimit || null,
      },
    });

    return successResponse(promotion, "Promotion created successfully", 201);
  } catch (error: any) {
    console.error("Error creating promotion:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Promotion with this code already exists",
        409,
        [{ field: "code", message: "Promotion code must be unique" }]
      );
    }
    return errorResponse(
      "CREATE_PROMOTION_ERROR",
      "Failed to create promotion",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

