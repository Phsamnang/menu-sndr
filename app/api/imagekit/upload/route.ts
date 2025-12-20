import { NextRequest, NextResponse } from "next/server";
import { uploadToImageKit } from "@/utils/imagekit";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToImageKit(
      buffer,
      file.name,
      folder || "image_menus_sndr"
    );

    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      path: result.filePath,
    });
  } catch (error) {
    console.error("Error uploading to ImageKit:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

