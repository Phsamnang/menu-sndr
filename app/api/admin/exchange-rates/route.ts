import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCurrency = searchParams.get("fromCurrency");
    const toCurrency = searchParams.get("toCurrency");
    const latest = searchParams.get("latest") === "true";

    const where: any = {};

    if (fromCurrency) {
      where.fromCurrency = fromCurrency;
    }

    if (toCurrency) {
      where.toCurrency = toCurrency;
    }

    const orderBy: any = latest
      ? { effectiveDate: "desc" }
      : { effectiveDate: "desc" };

    const rates = await prisma.exchangeRate.findMany({
      where,
      orderBy,
      take: latest ? 1 : undefined,
    });

    return successResponse({ items: rates, total: rates.length }, "Exchange rates fetched successfully");
  } catch (error: any) {
    console.error("Error fetching exchange rates:", error);
    return errorResponse(
      "FETCH_EXCHANGE_RATES_ERROR",
      "Failed to fetch exchange rates",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { fromCurrency, toCurrency, rate, effectiveDate, source } = body;

    if (!fromCurrency || !toCurrency || rate === undefined) {
      return errorResponse(
        "VALIDATION_ERROR",
        "fromCurrency, toCurrency, and rate are required",
        400,
        [
          ...(!fromCurrency
            ? [{ field: "fromCurrency", message: "From currency is required" }]
            : []),
          ...(!toCurrency
            ? [{ field: "toCurrency", message: "To currency is required" }]
            : []),
          ...(rate === undefined
            ? [{ field: "rate", message: "Rate is required" }]
            : []),
        ]
      );
    }

    if (rate <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Rate must be greater than 0",
        400,
        [{ field: "rate", message: "Rate must be positive" }]
      );
    }

    const exchangeRate = await prisma.exchangeRate.create({
      data: {
        fromCurrency,
        toCurrency,
        rate,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        source: source || null,
        createdBy: request.user?.id || null,
      },
    });

    return successResponse(exchangeRate, "Exchange rate created successfully", 201);
  } catch (error: any) {
    console.error("Error creating exchange rate:", error);
    return errorResponse(
      "CREATE_EXCHANGE_RATE_ERROR",
      "Failed to create exchange rate",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

