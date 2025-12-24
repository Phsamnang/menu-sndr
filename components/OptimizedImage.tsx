"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [hasError, setHasError] = useState(false);

  if (!src || src.trim() === "" || hasError) {
    return (
      <div
        className={`${className} bg-slate-200 flex items-center justify-center`}
        style={{ width: width || "100%", height: height || "100%" }}
      >
        <span className="text-slate-400 text-sm">No Image</span>
      </div>
    );
  }

  const isImageKitUrl = src.includes("imagekit.io");

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 200}
      height={height || 200}
      className={className}
      quality={quality}
      loading="lazy"
      onError={(e) => {
        console.error("Image load error:", {
          src: src,
          error: e,
        });
        setHasError(true);
      }}
      unoptimized={isImageKitUrl}
      priority={false}
    />
  );
}
