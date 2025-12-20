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

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true,
        prices: {
          include: {
            tableType: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

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

    return NextResponse.json(formatted);
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

    if (!name || !description || !image || !categoryId) {
      return NextResponse.json(
        { error: "Name, description, image, and categoryId are required" },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
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

