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
    const setting = await prisma.settings.findUnique({
      where: { id },
    });

    if (!setting) {
      return errorResponse(
        "NOT_FOUND",
        "Setting not found",
        404,
        [{ message: "Setting with this ID does not exist" }]
      );
    }

    return successResponse(setting, "Setting fetched successfully");
  } catch (error: any) {
    console.error("Error fetching setting:", error);
    return errorResponse(
      "FETCH_SETTING_ERROR",
      "Failed to fetch setting",
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
    const { value, type, category, description, isPublic } = body;

    const existingSetting = await prisma.settings.findUnique({
      where: { id },
    });

    if (!existingSetting) {
      return errorResponse(
        "NOT_FOUND",
        "Setting not found",
        404,
        [{ message: "Setting with this ID does not exist" }]
      );
    }

    const updateData: any = {};
    if (value !== undefined) updateData.value = value;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description || null;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    updateData.updatedBy = request.user?.id || null;

    const setting = await prisma.settings.update({
      where: { id },
      data: updateData,
    });

    return successResponse(setting, "Setting updated successfully");
  } catch (error: any) {
    console.error("Error updating setting:", error);
    return errorResponse(
      "UPDATE_SETTING_ERROR",
      "Failed to update setting",
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

    const existingSetting = await prisma.settings.findUnique({
      where: { id },
    });

    if (!existingSetting) {
      return errorResponse(
        "NOT_FOUND",
        "Setting not found",
        404,
        [{ message: "Setting with this ID does not exist" }]
      );
    }

    await prisma.settings.delete({
      where: { id },
    });

    return successResponse(null, "Setting deleted successfully");
  } catch (error: any) {
    console.error("Error deleting setting:", error);
    return errorResponse(
      "DELETE_SETTING_ERROR",
      "Failed to delete setting",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);

