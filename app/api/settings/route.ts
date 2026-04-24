import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");

    if (key) {
      const setting = await prisma.settings.findFirst({
        where: { key, isPublic: true },
      });
      return successResponse(setting, "Setting fetched successfully");
    }

    const settings = await prisma.settings.findMany({
      where: { isPublic: true },
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });
    return successResponse(
      { items: settings, total: settings.length },
      "Settings fetched successfully"
    );
  } catch (error: any) {
    return errorResponse("FETCH_SETTINGS_ERROR", "Failed to fetch settings", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}
