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
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      return errorResponse(
        "NOT_FOUND",
        "Promotion not found",
        404,
        [{ message: "Promotion with this ID does not exist" }]
      );
    }

    return successResponse(promotion, "Promotion fetched successfully");
  } catch (error: any) {
    console.error("Error fetching promotion:", error);
    return errorResponse(
      "FETCH_PROMOTION_ERROR",
      "Failed to fetch promotion",
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
      isActive,
    } = body;

    const existingPromotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!existingPromotion) {
      return errorResponse(
        "NOT_FOUND",
        "Promotion not found",
        404,
        [{ message: "Promotion with this ID does not exist" }]
      );
    }

    if (code && code !== existingPromotion.code) {
      const duplicate = await prisma.promotion.findFirst({
        where: {
          code,
          id: { not: id },
        },
      });

      if (duplicate) {
        return errorResponse(
          "DUPLICATE_ENTRY",
          "Promotion with this code already exists",
          409,
          [{ field: "code", message: "Promotion code must be unique" }]
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (code !== undefined) updateData.code = code || null;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (minOrderAmount !== undefined)
      updateData.minOrderAmount = minOrderAmount || null;
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount || null;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (startTime !== undefined) updateData.startTime = startTime || null;
    if (endTime !== undefined) updateData.endTime = endTime || null;
    if (applicableDays !== undefined)
      updateData.applicableDays = applicableDays
        ? JSON.stringify(applicableDays)
        : null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const promotion = await prisma.promotion.update({
      where: { id },
      data: updateData,
    });

    return successResponse(promotion, "Promotion updated successfully");
  } catch (error: any) {
    console.error("Error updating promotion:", error);
    return errorResponse(
      "UPDATE_PROMOTION_ERROR",
      "Failed to update promotion",
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

    const existingPromotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!existingPromotion) {
      return errorResponse(
        "NOT_FOUND",
        "Promotion not found",
        404,
        [{ message: "Promotion with this ID does not exist" }]
      );
    }

    await prisma.promotion.delete({
      where: { id },
    });

    return successResponse(null, "Promotion deleted successfully");
  } catch (error: any) {
    console.error("Error deleting promotion:", error);
    return errorResponse(
      "DELETE_PROMOTION_ERROR",
      "Failed to delete promotion",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);

