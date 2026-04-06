import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function postHandler(
  request: AuthenticatedRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; paymentId: string }>;
  }
) {
  try {
    const { id, paymentId } = await params;

    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty, that's fine
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return errorResponse("NOT_FOUND", "Payment not found", 404);
    }

    if (payment.orderId !== id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Payment does not belong to this order",
        400
      );
    }

    if (payment.status === "refunded") {
      return errorResponse(
        "VALIDATION_ERROR",
        "Payment has already been refunded",
        400
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        paidAmount: true,
        grandTotal: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return errorResponse("NOT_FOUND", "Order not found", 404);
    }

    const newPaidAmount = Math.max(0, order.paidAmount - payment.amount);
    let newPaymentStatus = order.paymentStatus;
    if (newPaidAmount <= 0) {
      newPaymentStatus = "refunded";
    } else if (newPaidAmount < order.grandTotal) {
      newPaymentStatus = "partial";
    } else {
      newPaymentStatus = "paid";
    }

    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "refunded",
          refundedAt: new Date(),
          notes: reason || payment.notes,
        },
      }),
      prisma.order.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
        },
      }),
    ]);

    return successResponse(updatedPayment, "Payment refunded successfully");
  } catch (error: any) {
    console.error("Error refunding payment:", error);
    return errorResponse(
      "REFUND_PAYMENT_ERROR",
      "Failed to refund payment",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string; paymentId: string }>;
  }
) {
  return withAuth((req) => postHandler(req, context), ["admin"])(request);
}
