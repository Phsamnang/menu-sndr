import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_GUi4rT/ow9ZUWxoxtT8idACUVXo=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_4Qo3RmABK/FxLMJbnh2TPAApnXc=",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/4paezevxw",
});

export function getImageKitUrl(path: string, transformations?: any): string {
  try {
    return imagekit.url({
      path: path,
      transformation: transformations || [],
    });
  } catch (error) {
    const baseUrl = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/4paezevxw";
    const transformStr = transformations
      ?.map((t: any) => {
        const parts: string[] = [];
        if (t.width) parts.push(`w-${t.width}`);
        if (t.height) parts.push(`h-${t.height}`);
        if (t.quality) parts.push(`q-${t.quality}`);
        if (t.format) parts.push(`f-${t.format}`);
        return parts.join(",");
      })
      .filter(Boolean)
      .join("/");
    
    const pathWithoutLeadingSlash = path.startsWith("/") ? path.slice(1) : path;
    const transformPath = transformStr ? `tr:${transformStr}/` : "";
    return `${baseUrl}/${transformPath}${pathWithoutLeadingSlash}`;
  }
}

export function uploadToImageKit(
  file: Buffer | string,
  fileName: string,
  folder?: string
): Promise<any> {
  return imagekit.upload({
    file: file,
    fileName: fileName,
    folder: folder || "image_menus_sndr",
  });
}

