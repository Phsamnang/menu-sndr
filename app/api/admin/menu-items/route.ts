import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch menu items",
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image, categoryId, prices } = body;

    if (!name || !image || !categoryId) {
      return NextResponse.json(
        { error: "Name, image, and categoryId are required" },
        { status: 400 }
      );
    }

    const existingItem = await prisma.menuItem.findFirst({
      where: {
        name,
        categoryId,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Menu item with this name already exists in this category" },
        { status: 409 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description: description || "",
        image,
        categoryId,
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

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error: any) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { 
        error: "Failed to create menu item",
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

