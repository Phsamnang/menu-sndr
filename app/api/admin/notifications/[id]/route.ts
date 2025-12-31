import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isRead } = body;

    const existingNotification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      return errorResponse(
        "NOT_FOUND",
        "Notification not found",
        404,
        [{ message: "Notification with this ID does not exist" }]
      );
    }

    const updateData: any = {};
    if (isRead !== undefined) {
      updateData.isRead = isRead;
      if (isRead && !existingNotification.readAt) {
        updateData.readAt = new Date();
      } else if (!isRead) {
        updateData.readAt = null;
      }
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: updateData,
    });

    return successResponse(notification, "Notification updated successfully");
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return errorResponse(
      "UPDATE_NOTIFICATION_ERROR",
      "Failed to update notification",
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

    const existingNotification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      return errorResponse(
        "NOT_FOUND",
        "Notification not found",
        404,
        [{ message: "Notification with this ID does not exist" }]
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

    return successResponse(null, "Notification deleted successfully");
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return errorResponse(
      "DELETE_NOTIFICATION_ERROR",
      "Failed to delete notification",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const PUT = withAuth(putHandler, ["admin"]);
export const DELETE = withAuth(deleteHandler, ["admin"]);

