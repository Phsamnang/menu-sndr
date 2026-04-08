import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/utils/auth";
import { errorResponse } from "@/utils/api-response";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    username: string;
    roleId: string;
    roleName?: string;
  };
}

// Simple in-memory cache for roleId → roleName (rarely changes)
const roleCache = new Map<string, { name: string; expiresAt: number }>();
const ROLE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getRoleName(roleId: string): Promise<string | null> {
  const cached = roleCache.get(roleId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.name;
  }

  const user = await prisma.user.findUnique({
    where: { id: roleId },
    select: { role: { select: { name: true } } },
  });

  // Fallback: look up by roleId directly on Role table
  if (!user) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { name: true },
    });
    if (role) {
      roleCache.set(roleId, { name: role.name, expiresAt: Date.now() + ROLE_CACHE_TTL });
      return role.name;
    }
    return null;
  }

  roleCache.set(roleId, { name: user.role.name, expiresAt: Date.now() + ROLE_CACHE_TTL });
  return user.role.name;
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
      // Use roleName from JWT if available (new tokens), otherwise fall back to DB
      let roleName = payload.roleName;
      if (!roleName) {
        roleName = await getRoleName(payload.userId) ?? undefined;
      }

      if (!roleName || !allowedRoles.includes(roleName)) {
        return errorResponse("FORBIDDEN", "Insufficient permissions", 403, [
          { message: "You don't have permission to access this resource" },
        ]);
      }

      (request as AuthenticatedRequest).user = { ...payload, roleName };
    } else {
      (request as AuthenticatedRequest).user = payload;
    }

    return handler(request as AuthenticatedRequest);
  };
}
