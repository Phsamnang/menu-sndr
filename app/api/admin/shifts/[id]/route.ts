import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            role: true,
          },
        },
        sessions: true,
      },
    });

    if (!shift) {
      return errorResponse(
        "NOT_FOUND",
        "Shift not found",
        404,
        [{ message: "Shift with this ID does not exist" }]
      );
    }

    return successResponse(shift, "Shift fetched successfully");
  } catch (error: any) {
    console.error("Error fetching shift:", error);
    return errorResponse(
      "FETCH_SHIFT_ERROR",
      "Failed to fetch shift",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { clockOut, breakMinutes, status, notes, totalHours } = body;

    const existingShift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!existingShift) {
      return errorResponse(
        "NOT_FOUND",
        "Shift not found",
        404,
        [{ message: "Shift with this ID does not exist" }]
      );
    }

    const updateData: any = {};
    if (clockOut !== undefined) {
      updateData.clockOut = clockOut ? new Date(clockOut) : null;
    }
    if (breakMinutes !== undefined) {
      updateData.breakMinutes = breakMinutes;
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }
    if (totalHours !== undefined) {
      updateData.totalHours = totalHours;
    }

    const shift = await prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          include: {
            role: true,
          },
        },
        sessions: true,
      },
    });

    return successResponse(shift, "Shift updated successfully");
  } catch (error: any) {
    console.error("Error updating shift:", error);
    return errorResponse(
      "UPDATE_SHIFT_ERROR",
      "Failed to update shift",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingShift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!existingShift) {
      return errorResponse(
        "NOT_FOUND",
        "Shift not found",
        404,
        [{ message: "Shift with this ID does not exist" }]
      );
    }

    await prisma.shift.delete({
      where: { id },
    });

    return successResponse(null, "Shift deleted successfully");
  } catch (error: any) {
    console.error("Error deleting shift:", error);
    return errorResponse(
      "DELETE_SHIFT_ERROR",
      "Failed to delete shift",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);

