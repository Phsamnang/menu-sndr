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
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            unit: true,
          },
        },
      },
    });

    if (!expense) {
      return errorResponse(
        "NOT_FOUND",
        "Expense not found",
        404,
        [{ message: "Expense with this ID does not exist" }]
      );
    }

    return successResponse(expense, "Expense fetched successfully");
  } catch (error: any) {
    console.error("Error fetching expense:", error);
    return errorResponse(
      "FETCH_EXPENSE_ERROR",
      "Failed to fetch expense",
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
      title,
      description,
      amount,
      category,
      date,
      receiptNumber,
      vendor,
      paymentMethod,
      receiptImage,
      notes,
    } = body;

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return errorResponse(
        "NOT_FOUND",
        "Expense not found",
        404,
        [{ message: "Expense with this ID does not exist" }]
      );
    }

    if (amount !== undefined && amount <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Amount must be greater than 0",
        400,
        [{ field: "amount", message: "Amount must be greater than 0" }]
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = new Date(date);
    if (receiptNumber !== undefined)
      updateData.receiptNumber = receiptNumber || null;
    if (vendor !== undefined) updateData.vendor = vendor || null;
    if (paymentMethod !== undefined)
      updateData.paymentMethod = paymentMethod || null;
    if (receiptImage !== undefined) updateData.receiptImage = receiptImage || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    return successResponse(expense, "Expense updated successfully");
  } catch (error: any) {
    console.error("Error updating expense:", error);
    return errorResponse(
      "UPDATE_EXPENSE_ERROR",
      "Failed to update expense",
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

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return errorResponse(
        "NOT_FOUND",
        "Expense not found",
        404,
        [{ message: "Expense with this ID does not exist" }]
      );
    }

    await prisma.expense.delete({
      where: { id },
    });

    return successResponse(null, "Expense deleted successfully");
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return errorResponse(
      "DELETE_EXPENSE_ERROR",
      "Failed to delete expense",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => getHandler(req, context), ["admin"])(request);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => putHandler(req, context), ["admin"])(request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => deleteHandler(req, context), ["admin"])(request);
}

