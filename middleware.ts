import { NextResponse } from "next/server";

// Disabled server-side auth middleware because the app uses a custom
// localStorage-based token, not NextAuth session cookies. The previous
// NextAuth middleware always redirected /admin back to /login.
export function middleware() {
  return NextResponse.next();
}

// No matcher so this middleware is effectively a pass-through.

