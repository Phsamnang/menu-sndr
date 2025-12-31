import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.reservedDate = { gte: startDate, lte: endDate };
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          table: {
            include: {
              tableType: true,
            },
          },
          customer: true,
        },
        orderBy: { reservedDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.reservation.count({ where }),
    ]);

    return successResponse(
      {
        items: reservations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      "Reservations fetched successfully"
    );
  } catch (error: any) {
    console.error("Error fetching reservations:", error);
    return errorResponse("FETCH_RESERVATIONS_ERROR", "Failed to fetch reservations", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const {
      tableId,
      customerId,
      customerName,
      customerPhone,
      guestCount,
      reservedDate,
      reservedTime,
      duration,
      notes,
    } = body;

    if (!tableId || !customerName || !customerPhone || !reservedDate || !reservedTime) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Table, customer name, phone, date, and time are required",
        400
      );
    }

    let finalCustomerId = customerId || null;

    if (!finalCustomerId) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone: customerPhone },
      });

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
        if (existingCustomer.name !== customerName) {
          await prisma.customer.update({
            where: { id: existingCustomer.id },
            data: { name: customerName },
          });
        }
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
          },
        });
        finalCustomerId = newCustomer.id;
      }
    }

    const [reservation] = await Promise.all([
      prisma.reservation.create({
        data: {
          tableId,
          customerId: finalCustomerId,
          customerName,
          customerPhone,
          guestCount: guestCount || 1,
          reservedDate: new Date(reservedDate),
          reservedTime,
          duration: duration || 120,
          notes: notes || null,
          createdBy: request.user?.userId || null,
        },
        include: {
          table: {
            include: {
              tableType: true,
            },
          },
          customer: true,
        },
      }),
      prisma.table.update({
        where: { id: tableId },
        data: { status: "reserved" },
      }),
    ]);

    return successResponse(reservation, "Reservation created successfully", 201);
  } catch (error: any) {
    console.error("Error creating reservation:", error);
    if (error?.code === "P2002") {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "Customer with this phone already exists with different details",
        409,
        [{ field: "phone", message: "Phone number conflict" }]
      );
    }
    return errorResponse("CREATE_RESERVATION_ERROR", "Failed to create reservation", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

