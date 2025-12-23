import { NextRequest } from "next/server";
import { uploadToImageKit } from "@/utils/imagekit";
import { successResponse, errorResponse } from "@/utils/api-response";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function handler(request: AuthenticatedRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return errorResponse(
        "VALIDATION_ERROR",
        "No file provided",
        400,
        [{ field: "file", message: "File is required" }]
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToImageKit(
      buffer,
      file.name,
      folder || "image_menus_sndr"
    );

    return successResponse({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      path: result.filePath,
    }, "Image uploaded successfully");
  } catch (error: any) {
    console.error("Error uploading to ImageKit:", error);
    return errorResponse(
      "IMAGEKIT_UPLOAD_ERROR",
      "Failed to upload image",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

export const POST = withAuth(handler, ["admin"]);

