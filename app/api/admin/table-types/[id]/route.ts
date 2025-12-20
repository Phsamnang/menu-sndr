import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, displayName, order } = body;

    const tableType = await prisma.tableType.update({
      where: { id },
      data: { name, displayName, order },
    });

    return NextResponse.json(tableType);
  } catch (error) {
    console.error("Error updating table type:", error);
    return NextResponse.json(
      { error: "Failed to update table type" },
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
    await prisma.tableType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting table type:", error);
    return NextResponse.json(
      { error: "Failed to delete table type" },
      { status: 500 }
    );
  }
}

