import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tableTypes = await prisma.tableType.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(tableTypes);
  } catch (error: any) {
    console.error("Error fetching table types:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch table types",
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName, order } = body;

    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Name and displayName are required" },
        { status: 400 }
      );
    }

    const tableType = await prisma.tableType.create({
      data: { name, displayName, order: order || 0 },
    });

    return NextResponse.json(tableType, { status: 201 });
  } catch (error: any) {
    console.error("Error creating table type:", error);
    return NextResponse.json(
      { 
        error: "Failed to create table type",
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

