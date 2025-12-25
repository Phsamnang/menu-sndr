import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;
    const take = limit ? parseInt(limit) : undefined;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        include: {
          items: {
            include: {
              product: true,
              unit: true,
            },
          },
        },
        skip,
        take,
      }),
      prisma.expense.count({ where }),
    ]);

    return successResponse(
      { items: expenses, total },
      "Expenses fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return errorResponse(
      "FETCH_EXPENSES_ERROR",
      "Failed to fetch expenses",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      date,
      receiptNumber,
      vendor,
      paymentMethod,
      receiptImage,
      notes,
      items,
    } = body;

    if (!title || !category) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Title and category are required",
        400,
        [
          ...(!title ? [{ field: "title", message: "Title is required" }] : []),
          ...(!category
            ? [{ field: "category", message: "Category is required" }]
            : []),
        ]
      );
    }

    // Items are optional - can create expense first, add items later
    // Exchange rate: 1 USD = 4000 KHR (can be made configurable later)
    const USD_TO_KHR_RATE = 4000;
    
    let totalAmountUSD = 0;
    let totalAmountKHR = 0; // Only KHR items (no conversion)
    const expenseItems = [];
    
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (!item.productName || !item.unitPrice || !item.quantity) {
          throw new Error("Each item must have productName, unitPrice, and quantity");
        }
        const quantity = parseFloat(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);
        const totalPrice = quantity * unitPrice;
        const itemCurrency = item.currency || "USD";
        
        if (itemCurrency === "USD") {
          totalAmountUSD += totalPrice;
        } else if (itemCurrency === "KHR") {
          totalAmountKHR += totalPrice; // Only KHR items
        }

        expenseItems.push({
          productId: item.productId || null,
          productName: item.productName,
          quantity,
          unitId: item.unitId || null,
          unitPrice,
          totalPrice,
          currency: itemCurrency,
          paymentStatus: item.paymentStatus || "UNPAID",
          notes: item.notes || null,
        });
      }
    }

    // Total amount in KHR = KHR items + (USD items converted to KHR)
    const totalAmountInKHR = totalAmountKHR + (totalAmountUSD * USD_TO_KHR_RATE);

    const expense = await prisma.expense.create({
      data: {
        title,
        description: description || null,
        amount: totalAmountInKHR, // Total in KHR (KHR items + USD items converted to KHR)
        amountUSD: totalAmountUSD,
        amountKHR: totalAmountKHR, // Only KHR items total (no USD conversion)
        category,
        date: date ? new Date(date) : new Date(),
        receiptNumber: receiptNumber || null,
        vendor: vendor || null,
        paymentMethod: paymentMethod || null,
        receiptImage: receiptImage || null,
        notes: notes || null,
        currency: body.currency || "USD",
        items: expenseItems.length > 0 ? {
          create: expenseItems,
        } : undefined,
      },
      include: {
        items: {
          include: {
            product: true,
            unit: true,
          },
        },
      },
    });

    return successResponse(expense, "Expense created successfully", 201);
  } catch (error: any) {
    console.error("Error creating expense:", error);
    return errorResponse(
      "CREATE_EXPENSE_ERROR",
      "Failed to create expense",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

