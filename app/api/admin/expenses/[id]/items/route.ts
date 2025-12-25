import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function postHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      productId,
      productName,
      quantity,
      unitId,
      unitPrice,
      currency,
      paymentStatus,
      notes,
    } = body;

    if (!productName || !unitPrice || !quantity) {
      return errorResponse(
        "VALIDATION_ERROR",
        "productName, unitPrice, and quantity are required",
        400,
        [
          ...(!productName
            ? [{ field: "productName", message: "Product name is required" }]
            : []),
          ...(!unitPrice
            ? [{ field: "unitPrice", message: "Unit price is required" }]
            : []),
          ...(!quantity || quantity <= 0
            ? [
                {
                  field: "quantity",
                  message: "Quantity must be greater than 0",
                },
              ]
            : []),
        ]
      );
    }

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return errorResponse("NOT_FOUND", "Expense not found", 404);
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);
    const totalPrice = qty * price;

    const itemCurrency = currency || "USD";

    const expenseItem = await prisma.expenseItem.create({
      data: {
        expenseId: id,
        productId: productId || null,
        productName,
        quantity: qty,
        unitId: unitId || null,
        unitPrice: price,
        totalPrice,
        currency: itemCurrency,
        paymentStatus: paymentStatus || "UNPAID",
        notes: notes || null,
      },
      include: {
        unit: true,
        product: true,
      },
    });

    // Calculate new totals by currency
    // Exchange rate: 1 USD = 4000 KHR (can be made configurable later)
    const USD_TO_KHR_RATE = 4000;

    const allItems = await prisma.expenseItem.findMany({
      where: { expenseId: id },
    });

    const newAmountUSD = allItems
      .filter((item: any) => item.currency === "USD")
      .reduce((sum: number, item: any) => sum + item.totalPrice, 0);

    // KHR items total (only items in KHR, no conversion)
    const khrItemsTotal = allItems
      .filter((item: any) => item.currency === "KHR")
      .reduce((sum: number, item: any) => sum + item.totalPrice, 0);

    // Total amount in KHR = KHR items + (USD items converted to KHR)
    const usdConvertedToKHR = newAmountUSD * USD_TO_KHR_RATE;
    const totalAmountInKHR = khrItemsTotal + usdConvertedToKHR;

    await prisma.expense.update({
      where: { id },
      data: {
        amount: totalAmountInKHR, // Total in KHR (KHR items + USD items converted to KHR)
        amountUSD: newAmountUSD,
        amountKHR: khrItemsTotal, // Only KHR items total (no USD conversion)
      },
    });

    const updatedExpense = await prisma.expense.findUnique({
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

    return successResponse(updatedExpense, "Item added successfully");
  } catch (error: any) {
    console.error("Error adding item:", error);
    return errorResponse("ADD_ITEM_ERROR", "Failed to add item", 500, [
      { message: error?.message || String(error) },
    ]);
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
      itemId,
      productId,
      productName,
      quantity,
      unitId,
      unitPrice,
      currency,
      paymentStatus,
      notes,
    } = body;

    if (!itemId) {
      return errorResponse("VALIDATION_ERROR", "itemId is required", 400, [
        { field: "itemId", message: "Item ID is required" },
      ]);
    }

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!expense) {
      return errorResponse("NOT_FOUND", "Expense not found", 404);
    }

    const existingItem = expense.items.find((item) => item.id === itemId);
    if (!existingItem) {
      return errorResponse("NOT_FOUND", "Item not found", 404);
    }

    const oldTotal = existingItem.totalPrice;
    let newTotalPrice = oldTotal;

    const updateData: any = {};
    if (productId !== undefined) updateData.productId = productId || null;
    if (productName !== undefined) updateData.productName = productName;
    if (unitId !== undefined) updateData.unitId = unitId || null;
    if (unitPrice !== undefined) updateData.unitPrice = parseFloat(unitPrice);
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (currency !== undefined) updateData.currency = currency;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes || null;

    if (
      updateData.quantity !== undefined ||
      updateData.unitPrice !== undefined
    ) {
      const qty = updateData.quantity ?? existingItem.quantity;
      const price = updateData.unitPrice ?? existingItem.unitPrice;
      newTotalPrice = qty * price;
      updateData.totalPrice = newTotalPrice;
    }

    await prisma.expenseItem.update({
      where: { id: itemId },
      data: updateData,
    });

    // Recalculate totals by currency from all items
    // Exchange rate: 1 USD = 4000 KHR (can be made configurable later)
    const USD_TO_KHR_RATE = 4000;

    const allItems = await prisma.expenseItem.findMany({
      where: { expenseId: id },
    });

    const newAmountUSD = allItems
      .filter((item: any) => item.currency === "USD")
      .reduce((sum: number, item: any) => sum + item.totalPrice, 0);

    // KHR items total (only items in KHR, no conversion)
    const khrItemsTotal = allItems
      .filter((item: any) => item.currency === "KHR")
      .reduce((sum: number, item: any) => sum + item.totalPrice, 0);

    // Total amount in KHR = KHR items + (USD items converted to KHR)
    const usdConvertedToKHR = newAmountUSD * USD_TO_KHR_RATE;
    const totalAmountInKHR = khrItemsTotal + usdConvertedToKHR;

    await prisma.expense.update({
      where: { id },
      data: {
        amount: totalAmountInKHR, // Total in KHR (KHR items + USD items converted to KHR)
        amountUSD: newAmountUSD,
        amountKHR: khrItemsTotal, // Only KHR items total (no USD conversion)
      },
    });

    const updatedExpense = await prisma.expense.findUnique({
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

    return successResponse(updatedExpense, "Item updated successfully");
  } catch (error: any) {
    console.error("Error updating item:", error);
    return errorResponse("UPDATE_ITEM_ERROR", "Failed to update item", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return errorResponse("VALIDATION_ERROR", "itemId is required", 400, [
        { field: "itemId", message: "Item ID is required" },
      ]);
    }

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!expense) {
      return errorResponse("NOT_FOUND", "Expense not found", 404);
    }

    const item = expense.items.find((i) => i.id === itemId);
    if (!item) {
      return errorResponse("NOT_FOUND", "Item not found", 404);
    }

    await prisma.expenseItem.delete({
      where: { id: itemId },
    });

    // Recalculate totals by currency from remaining items
    const remainingItems = await prisma.expenseItem.findMany({
      where: { expenseId: id },
    });

    // Exchange rate: 1 USD = 4000 KHR (can be made configurable later)
    const USD_TO_KHR_RATE = 4000;

    const newAmountUSD = remainingItems
      .filter((item: any) => item.currency === "USD")
      .reduce((sum: number, item: any) => sum + item.totalPrice, 0);

    // KHR total = KHR items + (USD items converted to KHR)
    const khrItemsTotal = remainingItems
      .filter((item: any) => item.currency === "KHR")
      .reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const usdConvertedToKHR = newAmountUSD * USD_TO_KHR_RATE;
    const newAmountKHR = khrItemsTotal + usdConvertedToKHR;

    await prisma.expense.update({
      where: { id },
      data: {
        amount: newAmountKHR, // Total in KHR (KHR items + USD items converted to KHR)
        amountUSD: newAmountUSD,
        amountKHR: newAmountKHR, // KHR items + (USD converted to KHR at 4000 KHR per USD)
      },
    });

    const updatedExpense = await prisma.expense.findUnique({
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

    return successResponse(updatedExpense, "Item deleted successfully");
  } catch (error: any) {
    console.error("Error deleting item:", error);
    return errorResponse("DELETE_ITEM_ERROR", "Failed to delete item", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => postHandler(req, context), ["admin"])(request);
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
