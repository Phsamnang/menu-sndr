import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { hashPassword } from "@/utils/auth";

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { username, password, roleId, isActive } = body;

    if (!username || !roleId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Username and roleId are required",
        400,
        [
          ...(!username
            ? [{ field: "username", message: "Username is required" }]
            : []),
          ...(!roleId
            ? [{ field: "roleId", message: "Role is required" }]
            : []),
        ]
      );
    }

    if (password && password.length < 6) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Password must be at least 6 characters",
        400,
        [{ field: "password", message: "Password must be at least 6 characters" }]
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return errorResponse("NOT_FOUND", "User not found", 404, [
        { message: "User does not exist" },
      ]);
    }

    const duplicateUser = await prisma.user.findFirst({
      where: {
        username,
        id: { not: id },
      },
    });

    if (duplicateUser) {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "User with this username already exists",
        409,
        [{ field: "username", message: "Username must be unique" }]
      );
    }

    const updateData: any = {
      username,
      roleId,
      isActive: isActive ?? existingUser.isActive,
    };

    if (password) {
      updateData.password = hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return successResponse(
      {
        ...userWithoutPassword,
        role: {
          id: user.role.id,
          name: user.role.name,
          displayName: user.role.displayName,
        },
      },
      "User updated successfully"
    );
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error?.code === "P2003") {
      return errorResponse(
        "INVALID_REFERENCE",
        "Invalid role reference",
        400,
        [{ field: "roleId", message: "Role does not exist" }]
      );
    }
    return errorResponse(
      "UPDATE_USER_ERROR",
      "Failed to update user",
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

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404, [
        { message: "User does not exist" },
      ]);
    }

    await prisma.user.delete({
      where: { id },
    });

    return successResponse(null, "User deleted successfully");
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return errorResponse(
      "DELETE_USER_ERROR",
      "Failed to delete user",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
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

