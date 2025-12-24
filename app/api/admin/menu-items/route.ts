import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

type MenuItemWithRelations = Prisma.MenuItemGetPayload<{
  include: {
    category: true;
    prices: {
      include: {
        tableType: true;
      };
    };
  };
}>;

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    const skip = (page - 1) * limit;

    const where: Prisma.MenuItemWhereInput = {};

    if (categoryId && search) {
      where.AND = [
        { categoryId },
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { category: { name: { contains: search, mode: "insensitive" } } },
            { category: { displayName: { contains: search, mode: "insensitive" } } },
          ],
        },
      ];
    } else if (categoryId) {
      where.categoryId = categoryId;
    } else if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { category: { displayName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          category: true,
          prices: {
            include: {
              tableType: true,
            },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.menuItem.count({ where }),
    ]);

    const formatted = menuItems.map((item: MenuItemWithRelations) => ({
      ...item,
      categoryName: item.category.name,
      prices: item.prices.map((p) => ({
        id: p.id,
        tableTypeId: p.tableTypeId,
        tableTypeName: p.tableType.name,
        amount: p.amount,
      })),
    }));

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      items: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }, "Menu items fetched successfully");
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    return errorResponse(
      "FETCH_MENU_ITEMS_ERROR",
      "Failed to fetch menu items",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { name, description, image, categoryId, prices, isCook } = body;

    if (!name || !image || !categoryId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Name, image, and categoryId are required",
        400,
        [
          ...(!name ? [{ field: "name", message: "Name is required" }] : []),
          ...(!image ? [{ field: "image", message: "Image is required" }] : []),
          ...(!categoryId ? [{ field: "categoryId", message: "CategoryId is required" }] : []),
        ]
      );
    }

    const existingItem = await prisma.menuItem.findFirst({
      where: {
        name,
        categoryId,
      },
    });

    if (existingItem) {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Menu item with this name already exists in this category",
        409,
        [{ field: "name", message: "Menu item name must be unique within category" }]
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description: description || "",
        image,
        categoryId,
        isCook: isCook ?? false,
        prices: {
          create: prices || [],
        },
      },
      include: {
        category: true,
        prices: {
          include: {
            tableType: true,
          },
        },
      },
    });

    return successResponse(menuItem, "Menu item created successfully", 201);
  } catch (error: any) {
    console.error("Error creating menu item:", error);
    if (error?.code === "P2003") {
      return errorResponse(
        "INVALID_REFERENCE",
        "Invalid category reference",
        400,
        [{ field: "categoryId", message: "Category does not exist" }]
      );
    }
    return errorResponse(
      "CREATE_MENU_ITEM_ERROR",
      "Failed to create menu item",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

