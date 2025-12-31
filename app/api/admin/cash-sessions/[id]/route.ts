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
    const session = await prisma.cashSession.findUnique({
      where: { id },
      include: {
        shift: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!session) {
      return errorResponse(
        "NOT_FOUND",
        "Cash session not found",
        404,
        [{ message: "Cash session with this ID does not exist" }]
      );
    }

    return successResponse(session, "Cash session fetched successfully");
  } catch (error: any) {
    console.error("Error fetching cash session:", error);
    return errorResponse(
      "FETCH_CASH_SESSION_ERROR",
      "Failed to fetch cash session",
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
    const {
      closingBalance,
      expectedBalance,
      totalSales,
      totalRefunds,
      totalExpenses,
      status,
      notes,
    } = body;

    const existingSession = await prisma.cashSession.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return errorResponse(
        "NOT_FOUND",
        "Cash session not found",
        404,
        [{ message: "Cash session with this ID does not exist" }]
      );
    }

    const updateData: any = {};
    if (closingBalance !== undefined) {
      updateData.closingBalance = closingBalance;
      if (!existingSession.closedAt) {
        updateData.closedAt = new Date();
      }
    }
    if (expectedBalance !== undefined) updateData.expectedBalance = expectedBalance;
    if (totalSales !== undefined) updateData.totalSales = totalSales;
    if (totalRefunds !== undefined) updateData.totalRefunds = totalRefunds;
    if (totalExpenses !== undefined) updateData.totalExpenses = totalExpenses;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "closed" && !existingSession.closedAt) {
        updateData.closedAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes || null;

    if (updateData.closingBalance !== undefined && updateData.expectedBalance !== undefined) {
      updateData.variance =
        updateData.expectedBalance - updateData.closingBalance;
    }

    const session = await prisma.cashSession.update({
      where: { id },
      data: updateData,
      include: {
        shift: {
          include: {
            user: true,
          },
        },
      },
    });

    return successResponse(session, "Cash session updated successfully");
  } catch (error: any) {
    console.error("Error updating cash session:", error);
    return errorResponse(
      "UPDATE_CASH_SESSION_ERROR",
      "Failed to update cash session",
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

    const existingSession = await prisma.cashSession.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return errorResponse(
        "NOT_FOUND",
        "Cash session not found",
        404,
        [{ message: "Cash session with this ID does not exist" }]
      );
    }

    await prisma.cashSession.delete({
      where: { id },
    });

    return successResponse(null, "Cash session deleted successfully");
  } catch (error: any) {
    console.error("Error deleting cash session:", error);
    return errorResponse(
      "DELETE_CASH_SESSION_ERROR",
      "Failed to delete cash session",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);

