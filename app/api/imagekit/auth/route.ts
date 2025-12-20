import { NextResponse } from "next/server";
import { imagekit } from "@/utils/imagekit";

export async function GET() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error("Error generating ImageKit auth:", error);
    return NextResponse.json(
      { error: "Failed to generate authentication" },
      { status: 500 }
    );
  }
}

