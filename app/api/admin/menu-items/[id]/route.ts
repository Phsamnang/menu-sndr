import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, image, categoryId, prices } = body;

    const existingItem = await prisma.menuItem.findFirst({
      where: {
        name,
        categoryId,
        id: { not: id },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Menu item with this name already exists in this category" },
        { status: 409 }
      );
    }

    await prisma.price.deleteMany({
      where: { menuItemId: id },
    });

    const menuItem = await prisma.menuItem.update({
      where: { id },
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

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

