import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    let shopInfo = await prisma.shopInfo.findFirst();

    if (!shopInfo) {
      shopInfo = await prisma.shopInfo.create({
        data: {
          name: "Shop Name",
          address: null,
          phone: null,
          email: null,
          logo: null,
          taxId: null,
        },
      });
    }

    return successResponse(shopInfo, "Shop info fetched successfully");
  } catch (error: any) {
    console.error("Error fetching shop info:", error);
    return errorResponse(
      "FETCH_SHOP_INFO_ERROR",
      "Failed to fetch shop info",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function putHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { name, address, phone, email, logo, taxId } = body;

    if (!name) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Name is required",
        400,
        [{ field: "name", message: "Name is required" }]
      );
    }

    let shopInfo = await prisma.shopInfo.findFirst();

    if (!shopInfo) {
      shopInfo = await prisma.shopInfo.create({
        data: {
          name,
          address: address || null,
          phone: phone || null,
          email: email || null,
          logo: logo || null,
          taxId: taxId || null,
        },
      });
    } else {
      shopInfo = await prisma.shopInfo.update({
        where: { id: shopInfo.id },
        data: {
          name,
          address: address || null,
          phone: phone || null,
          email: email || null,
          logo: logo || null,
          taxId: taxId || null,
        },
      });
    }

    return successResponse(shopInfo, "Shop info updated successfully");
  } catch (error: any) {
    console.error("Error updating shop info:", error);
    return errorResponse(
      "UPDATE_SHOP_INFO_ERROR",
      "Failed to update shop info",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const PUT = withAuth(putHandler, ["admin"]);

