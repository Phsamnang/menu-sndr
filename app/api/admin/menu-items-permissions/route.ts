import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401, [
        { message: "No session found" },
      ]);
    }

    const menuItems = await prisma.adminMenuItem.findMany({
      where: { isActive: true },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const formatted = menuItems.map((item) => ({
      id: item.id,
      href: item.href,
      iconName: item.iconName,
      title: item.title,
      description: item.description,
      iconColor: item.iconColor,
      allowedRoles: item.roles.map((r) => r.role.name),
    }));

    return successResponse(formatted, "Menu items retrieved successfully");
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    return errorResponse(
      "FETCH_ERROR",
      "Failed to fetch menu items",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

