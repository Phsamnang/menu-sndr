import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { hashPassword } from "@/utils/auth";

async function getHandler(request: AuthenticatedRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        roleId: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: { username: "asc" },
    });

    return successResponse(users, "Users fetched successfully");
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return errorResponse("FETCH_USERS_ERROR", "Failed to fetch users", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { username, password, roleId, isActive } = body;

    if (!username || !password || !roleId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Username, password, and roleId are required",
        400,
        [
          ...(!username
            ? [{ field: "username", message: "Username is required" }]
            : []),
          ...(!password
            ? [{ field: "password", message: "Password is required" }]
            : []),
          ...(!roleId
            ? [{ field: "roleId", message: "Role is required" }]
            : []),
        ]
      );
    }

    if (password.length < 6) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Password must be at least 6 characters",
        400,
        [
          {
            field: "password",
            message: "Password must be at least 6 characters",
          },
        ]
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "User with this username already exists",
        409,
        [{ field: "username", message: "Username must be unique" }]
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        roleId,
        isActive: isActive ?? true,
      },
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
      "User created successfully",
      201
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error?.code === "P2003") {
      return errorResponse("INVALID_REFERENCE", "Invalid role reference", 400, [
        { field: "roleId", message: "Role does not exist" },
      ]);
    }
    return errorResponse("CREATE_USER_ERROR", "Failed to create user", 500, [
      { message: error?.message || String(error) },
    ]);
  }
}

export const GET = withAuth(getHandler, ["admin"]);
export const POST = withAuth(postHandler, ["admin"]);
