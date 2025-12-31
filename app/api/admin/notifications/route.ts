import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const isRead = searchParams.get("isRead");
    const priority = searchParams.get("priority");

    const where: any = {};

    // If userId is not provided, show system-wide notifications or user's notifications
    if (userId) {
      where.userId = userId;
    } else {
      // Show system-wide notifications (userId is null) or current user's notifications
      where.OR = [
        { userId: null },
        { userId: request.user?.id },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isRead !== null) {
      where.isRead = isRead === "true";
    }

    if (priority) {
      where.priority = priority;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: [
        { priority: "asc" }, // urgent first
        { createdAt: "desc" },
      ],
    });

    return successResponse(notifications, "Notifications fetched successfully");
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return errorResponse(
      "FETCH_NOTIFICATIONS_ERROR",
      "Failed to fetch notifications",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, priority, actionUrl } = body;

    if (!type || !title || !message) {
      return errorResponse(
        "VALIDATION_ERROR",
        "type, title, and message are required",
        400,
        [
          ...(!type ? [{ field: "type", message: "Type is required" }] : []),
          ...(!title ? [{ field: "title", message: "Title is required" }] : []),
          ...(!message
            ? [{ field: "message", message: "Message is required" }]
            : []),
        ]
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: userId || null,
        type,
        title,
        message,
        priority: priority || "normal",
        actionUrl: actionUrl || null,
      },
    });

    return successResponse(notification, "Notification created successfully", 201);
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return errorResponse(
      "CREATE_NOTIFICATION_ERROR",
      "Failed to create notification",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);

