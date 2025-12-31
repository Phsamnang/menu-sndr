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
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        table: {
          include: {
            tableType: true,
          },
        },
        customer: true,
      },
    });

    if (!reservation) {
      return errorResponse("NOT_FOUND", "Reservation not found", 404);
    }

    return successResponse(reservation, "Reservation fetched successfully");
  } catch (error: any) {
    console.error("Error fetching reservation:", error);
    return errorResponse(
      "FETCH_RESERVATION_ERROR",
      "Failed to fetch reservation",
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
      status,
      tableId,
      guestCount,
      reservedDate,
      reservedTime,
      duration,
      notes,
    } = body;

    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
      select: {
        tableId: true,
        status: true,
        customerId: true,
        customerName: true,
      },
    });

    if (!existingReservation) {
      return errorResponse("NOT_FOUND", "Reservation not found", 404);
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (tableId !== undefined) updateData.tableId = tableId;
    if (guestCount !== undefined) updateData.guestCount = guestCount;
    if (reservedDate !== undefined)
      updateData.reservedDate = new Date(reservedDate);
    if (reservedTime !== undefined) updateData.reservedTime = reservedTime;
    if (duration !== undefined) updateData.duration = duration;
    if (notes !== undefined) updateData.notes = notes;

    const tableUpdates: Promise<any>[] = [];
    let orderCreation: Promise<any> | null = null;

    if (status !== undefined && status !== existingReservation.status) {
      if (status === "seated") {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const datePrefix = `${day}${month}${year}`;

        const lastOrder = await prisma.order.findFirst({
          where: {
            orderNumber: {
              startsWith: datePrefix,
            },
          },
          orderBy: {
            orderNumber: "desc",
          },
        });

        let counter = 1;
        if (lastOrder) {
          const lastCounter = parseInt(lastOrder.orderNumber.slice(-4), 10);
          if (!isNaN(lastCounter)) {
            counter = lastCounter + 1;
          }
        }

        const counterStr = String(counter).padStart(4, "0");
        const orderNumber = `${datePrefix}${counterStr}`;

        orderCreation = prisma.order.create({
          data: {
            orderNumber,
            tableId: existingReservation.tableId,
            customerId: existingReservation.customerId || null,
            customerName: existingReservation.customerName || null,
            orderType: "dine_in",
            status: "new",
            subtotal: 0,
            discountAmount: 0,
            taxRate: 0,
            taxAmount: 0,
            serviceCharge: 0,
            total: 0,
            grandTotal: 0,
            paymentStatus: "unpaid",
            createdBy: request.user?.userId || null,
            statusHistory: {
              create: {
                fromStatus: "new",
                toStatus: "new",
                changedBy: request.user?.userId || null,
              },
            },
          },
        });

        tableUpdates.push(
          prisma.table.update({
            where: { id: existingReservation.tableId },
            data: { status: "occupied" },
          })
        );
      } else if (status === "cancelled" || status === "no_show") {
        tableUpdates.push(
          prisma.table.update({
            where: { id: existingReservation.tableId },
            data: { status: "available" },
          })
        );
      } else if (status === "confirmed" || status === "pending") {
        tableUpdates.push(
          prisma.table.update({
            where: { id: existingReservation.tableId },
            data: { status: "reserved" },
          })
        );
      }
    }

    if (tableId !== undefined && tableId !== existingReservation.tableId) {
      tableUpdates.push(
        prisma.table.update({
          where: { id: existingReservation.tableId },
          data: { status: "available" },
        }),
        prisma.table.update({
          where: { id: tableId },
          data: { status: "reserved" },
        })
      );
    }

    const promises: Promise<any>[] = [
      prisma.reservation.update({
        where: { id },
        data: updateData,
        include: {
          table: {
            include: {
              tableType: true,
            },
          },
          customer: true,
        },
      }),
      ...tableUpdates,
    ];

    if (orderCreation) {
      promises.push(orderCreation);
    }

    const [reservation] = await Promise.all(promises);

    return successResponse(reservation, "Reservation updated successfully");
  } catch (error: any) {
    console.error("Error updating reservation:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Reservation not found", 404);
    }
    return errorResponse(
      "UPDATE_RESERVATION_ERROR",
      "Failed to update reservation",
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

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: {
        tableId: true,
      },
    });

    if (!reservation) {
      return errorResponse("NOT_FOUND", "Reservation not found", 404);
    }

    await Promise.all([
      prisma.reservation.delete({
        where: { id },
      }),
      prisma.table.update({
        where: { id: reservation.tableId },
        data: { status: "available" },
      }),
    ]);

    return successResponse(null, "Reservation deleted successfully");
  } catch (error: any) {
    console.error("Error deleting reservation:", error);
    if (error?.code === "P2025") {
      return errorResponse("NOT_FOUND", "Reservation not found", 404);
    }
    return errorResponse(
      "DELETE_RESERVATION_ERROR",
      "Failed to delete reservation",
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
