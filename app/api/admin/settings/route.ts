import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isPublic = searchParams.get("isPublic");

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === "true";
    }

    const settings = await prisma.settings.findMany({
      where,
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    return successResponse({ items: settings, total: settings.length }, "Settings fetched successfully");
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return errorResponse(
      "FETCH_SETTINGS_ERROR",
      "Failed to fetch settings",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { key, value, type, category, description, isPublic } = body;

    if (!key || !value || !type || !category) {
      return errorResponse(
        "VALIDATION_ERROR",
        "key, value, type, and category are required",
        400,
        [
          ...(!key ? [{ field: "key", message: "Key is required" }] : []),
          ...(!value ? [{ field: "value", message: "Value is required" }] : []),
          ...(!type ? [{ field: "type", message: "Type is required" }] : []),
          ...(!category
            ? [{ field: "category", message: "Category is required" }]
            : []),
        ]
      );
    }

    const setting = await prisma.settings.create({
      data: {
        key,
        value,
        type,
        category,
        description: description || null,
        isPublic: isPublic || false,
        updatedBy: request.user?.id || null,
      },
    });

    return successResponse(setting, "Setting created successfully", 201);
  } catch (error: any) {
    console.error("Error creating setting:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Setting with this key already exists",
        409,
        [{ field: "key", message: "Setting key must be unique" }]
      );
    }
    return errorResponse(
      "CREATE_SETTING_ERROR",
      "Failed to create setting",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

