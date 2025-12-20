"use client";

import { getOptimizedImageUrl } from "@/utils/imagekit-utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  quality = 80,
}: OptimizedImageProps) {
  if (!src || src.trim() === "") {
    return (
      <div
        className={`${className} bg-slate-200 flex items-center justify-center`}
        style={{ width: width || "100%", height: height || "100%" }}
      >
        <span className="text-slate-400 text-sm">No Image</span>
      </div>
    );
  }

  console.log("Original image URL from API:", src);

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} w-full h-full object-cover`}
      loading="lazy"
      style={{
        objectFit: "cover",
        objectPosition: "center",
      }}
      onError={(e) => {
        console.error("Image load error. URL:", src);
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const fallback = document.createElement("div");
        fallback.className = `${className} bg-slate-200 flex items-center justify-center w-full h-full`;
        fallback.innerHTML = `<span class="text-slate-400 text-sm">Image Error<br/><span class="text-xs">${src.substring(0, 50)}...</span></span>`;
        target.parentNode?.appendChild(fallback);
      }}
    />
  );
}

