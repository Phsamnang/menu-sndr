const IMAGEKIT_ENDPOINT = "https://ik.imagekit.io/4paezevxw";

function extractPathFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("imagekit.io")) return null;
  
  try {
    if (typeof window !== "undefined") {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      if (pathname.startsWith("/tr:")) {
        const pathMatch = pathname.match(/\/tr:[^\/]+\/(.+)/);
        return pathMatch ? `/${pathMatch[1]}` : pathname;
      }
      return pathname;
    } else {
      const match = url.match(/ik\.imagekit\.io\/[^\/]+(\/[^?]*)/);
      if (match && match[1]) {
        let path = match[1];
        if (path.startsWith("/tr:")) {
          const pathMatch = path.match(/\/tr:[^\/]+\/(.+)/);
          path = pathMatch ? `/${pathMatch[1]}` : path;
        }
        return path;
      }
      return null;
    }
  } catch (e) {
    const match = url.match(/ik\.imagekit\.io\/[^\/]+(\/[^?]*)/);
    if (match && match[1]) {
      let path = match[1];
      if (path.startsWith("/tr:")) {
        const pathMatch = path.match(/\/tr:[^\/]+\/(.+)/);
        path = pathMatch ? `/${pathMatch[1]}` : path;
      }
      return path;
    }
    return null;
  }
}

function buildImageKitUrl(
  path: string,
  transformations: any[]
): string {
  const baseUrl = IMAGEKIT_ENDPOINT;
  const transformStr = transformations
    .map((t) => {
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

export function transformImageUrl(url: string, width?: number, height?: number): string {
  const path = extractPathFromUrl(url);
  if (!path) return url;

  const transformations: any[] = [];
  if (width) transformations.push({ width });
  if (height) transformations.push({ height });
  
  return buildImageKitUrl(path, transformations);
}

export function getOptimizedImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
  }
): string {
  if (!url || typeof url !== "string") {
    console.warn("Invalid URL provided to getOptimizedImageUrl:", url);
    return url || "";
  }

  const path = extractPathFromUrl(url);
  if (!path) {
    return url;
  }

  const transformations: any[] = [];
  if (options?.width) transformations.push({ width: options.width });
  if (options?.height) transformations.push({ height: options.height });
  if (options?.quality) transformations.push({ quality: options.quality });
  if (options?.format) transformations.push({ format: options.format });
  
  const optimizedUrl = buildImageKitUrl(path, transformations);
  return optimizedUrl;
}

