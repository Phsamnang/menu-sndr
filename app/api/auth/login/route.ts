import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/utils/auth";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Username and password are required",
        400,
        [{ message: "Username and password are required" }]
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      return errorResponse(
        "INVALID_CREDENTIALS",
        "Invalid username or password",
        401,
        [{ message: "Invalid username or password" }]
      );
    }

    if (!user.isActive) {
      return errorResponse(
        "ACCOUNT_DISABLED",
        "Account is disabled",
        403,
        [{ message: "Account is disabled" }]
      );
    }

    const isValidPassword = verifyPassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse(
        "INVALID_CREDENTIALS",
        "Invalid username or password",
        401,
        [{ message: "Invalid username or password" }]
      );
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
    });

    return successResponse(
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: {
            id: user.role.id,
            name: user.role.name,
            displayName: user.role.displayName,
          },
        },
      },
      "Login successful"
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return errorResponse(
      "LOGIN_ERROR", 
      "Failed to login",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}


