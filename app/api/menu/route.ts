import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryName = searchParams.get("category");
    const tableTypeName = searchParams.get("tableType");

    const menuItems = await prisma.menuItem.findMany({
      where: categoryName
        ? {
            category: {
              name: categoryName,
            },
          }
        : undefined,
      include: {
        category: true,
        prices: {
          include: {
            tableType: true,
          },
          where: tableTypeName
            ? {
                tableType: {
                  name: tableTypeName,
                },
              }
            : undefined,
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedItems = menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      category: item.category.name,
      prices: item.prices.reduce(
        (acc, price) => {
          acc[price.tableType.name] = price.amount;
          return acc;
        },
        {} as Record<string, number>
      ),
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

