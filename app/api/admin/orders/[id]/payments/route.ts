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
    const payments = await prisma.payment.findMany({
      where: { orderId: id },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ items: payments, total: payments.length }, "Payments fetched successfully");
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return errorResponse(
      "FETCH_PAYMENTS_ERROR",
      "Failed to fetch payments",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, currency, method, reference, cardLast4, notes } = body;

    if (!amount || !method) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Amount and method are required",
        400,
        [
          ...(!amount
            ? [{ field: "amount", message: "Amount is required" }]
            : []),
          ...(!method
            ? [{ field: "method", message: "Payment method is required" }]
            : []),
        ]
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        grandTotal: true,
        paidAmount: true,
        paymentStatus: true,
        status: true,
        tableId: true,
      },
    });

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    const newPaidAmount = order.paidAmount + amount;
    let newPaymentStatus = order.paymentStatus;
    if (newPaidAmount >= order.grandTotal) {
      newPaymentStatus = "paid";
    } else if (newPaidAmount > 0) {
      newPaymentStatus = "partial";
    }

    // Determine if order status should be changed to "completed"
    const shouldCompleteOrder =
      newPaymentStatus === "paid" &&
      order.status !== "completed" &&
      order.status !== "cancelled";

    const orderUpdateData: any = {
      paidAmount: newPaidAmount,
      paymentStatus: newPaymentStatus,
    };

    if (shouldCompleteOrder) {
      orderUpdateData.status = "completed";
      orderUpdateData.completedAt = new Date();
    }

    const [payment, updatedOrder] = await Promise.all([
      prisma.payment.create({
        data: {
          orderId: id,
          amount,
          currency: currency || "USD",
          method,
          reference: reference || null,
          cardLast4: cardLast4 || null,
          notes: notes || null,
          processedBy: request.user?.userId || null,
        },
      }),
      prisma.order.update({
        where: { id },
        data: orderUpdateData,
      }),
      // Create status history entry if status changed to completed
      shouldCompleteOrder
        ? prisma.orderStatusHistory.create({
            data: {
              orderId: id,
              fromStatus: order.status,
              toStatus: "completed",
              changedBy: request.user?.userId || null,
              notes: "Order automatically completed after full payment",
            },
          })
        : Promise.resolve(null),
      // Update table status to available if order is completed
      shouldCompleteOrder && order.tableId
        ? prisma.table.update({
            where: { id: order.tableId },
            data: { status: "available" },
          })
        : Promise.resolve(null),
    ]);

    return successResponse(payment, "Payment created successfully", 201);
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return errorResponse(
      "CREATE_PAYMENT_ERROR",
      "Failed to create payment",
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((req) => postHandler(req, context), ["admin"])(request);
}
