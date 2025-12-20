import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tableTypes = await prisma.tableType.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(tableTypes);
  } catch (error) {
    console.error("Error fetching table types:", error);
    return NextResponse.json(
      { error: "Failed to fetch table types" },
      { status: 500 }
    );
  }
}

