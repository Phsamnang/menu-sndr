import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/utils/auth";
import { errorResponse } from "@/utils/api-response";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    username: string;
    roleId: string;
  };
}

export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (request: NextRequest) => {
    const token = getTokenFromRequest(request);

    if (!token) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401, [
        { message: "No token provided" },
      ]);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse("UNAUTHORIZED", "Invalid or expired token", 401, [
        { message: "Invalid or expired token" },
      ]);
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { role: true },
      });

      if (!user || !allowedRoles.includes(user.role.name)) {
        return errorResponse("FORBIDDEN", "Insufficient permissions", 403, [
          { message: "You don't have permission to access this resource" },
        ]);
      }
    }

    (request as AuthenticatedRequest).user = payload;
    return handler(request as AuthenticatedRequest);
  };
}

