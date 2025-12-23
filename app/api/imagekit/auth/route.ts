import { imagekit } from "@/utils/imagekit";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function GET() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return successResponse(authenticationParameters, "Authentication parameters generated successfully");
  } catch (error: any) {
    console.error("Error generating ImageKit auth:", error);
    return errorResponse(
      "IMAGEKIT_AUTH_ERROR",
      "Failed to generate authentication",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

